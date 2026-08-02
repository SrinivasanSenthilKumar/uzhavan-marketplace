import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Peer from 'simple-peer';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

/**
 * Props:
 *  show, onHide          - modal visibility control
 *  mode                  - 'outgoing' | 'incoming'
 *  targetUserId          - the other party's user id
 *  targetName            - the other party's display name (for outgoing calls)
 *  incomingOffer         - the WebRTC offer (only for incoming calls)
 */
const VideoCallModal = ({ show, onHide, mode, targetUserId, targetName, incomingOffer }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [status, setStatus] = useState('connecting'); // connecting | ringing | in-call | ended | rejected | unavailable
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerRef = useRef();
  const localStreamRef = useRef();

  useEffect(() => {
    if (!show) return;
    let cancelled = false;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) return;
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const peer = new Peer({ initiator: mode === 'outgoing', trickle: true, stream });
        peerRef.current = peer;

        peer.on('signal', (data) => {
          if (mode === 'outgoing') {
            if (data.type === 'offer') {
              setStatus('ringing');
              socket.emit('call:invite', { receiverId: targetUserId, offer: data, callerName: user.name });
            } else if (data.candidate) {
              socket.emit('call:ice-candidate', { targetId: targetUserId, candidate: data });
            }
          } else {
            if (data.type === 'answer') {
              socket.emit('call:answer', { callerId: targetUserId, answer: data });
            } else if (data.candidate) {
              socket.emit('call:ice-candidate', { targetId: targetUserId, candidate: data });
            }
          }
        });

        peer.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
          setStatus('in-call');
        });

        peer.on('close', () => setStatus('ended'));
        peer.on('error', () => setStatus('ended'));

        if (mode === 'incoming' && incomingOffer) {
          peer.signal(incomingOffer);
        }
      } catch (err) {
        console.error('Media device error:', err);
        setStatus('ended');
      }
    };

    start();

    const onAccepted = ({ answer }) => {
      peerRef.current?.signal(answer);
    };
    const onIce = ({ candidate }) => {
      peerRef.current?.signal(candidate);
    };
    const onRejected = () => setStatus('rejected');
    const onEnded = () => setStatus('ended');
    const onUnavailable = () => setStatus('unavailable');

    socket?.on('call:accepted', onAccepted);
    socket?.on('call:ice-candidate', onIce);
    socket?.on('call:rejected', onRejected);
    socket?.on('call:ended', onEnded);
    socket?.on('call:unavailable', onUnavailable);

    return () => {
      cancelled = true;
      socket?.off('call:accepted', onAccepted);
      socket?.off('call:ice-candidate', onIce);
      socket?.off('call:rejected', onRejected);
      socket?.off('call:ended', onEnded);
      socket?.off('call:unavailable', onUnavailable);
      peerRef.current?.destroy();
      localStreamRef.current?.getTracks().forEach((tr) => tr.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const handleEndCall = () => {
    socket?.emit('call:end', { targetId: targetUserId });
    peerRef.current?.destroy();
    localStreamRef.current?.getTracks().forEach((tr) => tr.stop());
    onHide();
  };

  const statusLabel = {
    connecting: 'Connecting camera...',
    ringing: `Calling ${targetName || ''}...`,
    'in-call': 'Connected',
    ended: 'Call ended',
    rejected: 'Call declined',
    unavailable: 'User is offline'
  };

  return (
    <Modal show={show} onHide={handleEndCall} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Video Call {targetName ? `with ${targetName}` : ''}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-2 text-muted">{statusLabel[status]}</div>
        <div className="d-flex gap-2 justify-content-center flex-wrap">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="rounded bg-dark"
            style={{ width: '100%', maxWidth: 480, height: 320, objectFit: 'cover' }}
          />
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="rounded bg-secondary position-absolute"
            style={{ width: 130, height: 100, objectFit: 'cover', bottom: 90, right: 40, border: '2px solid #fff' }}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" className="rounded-pill px-4" onClick={handleEndCall}>
          <i className="bi bi-telephone-x me-1"></i> End Call
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VideoCallModal;
