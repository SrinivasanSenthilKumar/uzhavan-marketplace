import React, { useState } from 'react';
import { Toast, Button } from 'react-bootstrap';
import { useSocket } from '../context/SocketContext';
import VideoCallModal from './VideoCallModal';

const IncomingCallAlert = () => {
  const { incomingCall, clearIncomingCall, socket } = useSocket();
  const [acceptedCall, setAcceptedCall] = useState(null);

  if (!incomingCall && !acceptedCall) return null;

  const handleAccept = () => {
    setAcceptedCall(incomingCall);
    clearIncomingCall();
  };

  const handleDecline = () => {
    socket?.emit('call:reject', { callerId: incomingCall.callerId });
    clearIncomingCall();
  };

  return (
    <>
      {incomingCall && !acceptedCall && (
        <Toast
          show={true}
          onClose={handleDecline}
          className="position-fixed top-0 start-50 translate-middle-x mt-3 shadow-lg"
          style={{ zIndex: 2000, minWidth: 320 }}
        >
          <Toast.Header closeButton={false}>
            <i className="bi bi-camera-video-fill text-success me-2"></i>
            <strong className="me-auto">Incoming Video Call</strong>
          </Toast.Header>
          <Toast.Body>
            <div className="mb-2">{incomingCall.callerName || 'Someone'} is calling you...</div>
            <div className="d-flex gap-2">
              <Button variant="success" size="sm" className="rounded-pill flex-grow-1" onClick={handleAccept}>
                <i className="bi bi-telephone-fill me-1"></i> Accept
              </Button>
              <Button variant="danger" size="sm" className="rounded-pill flex-grow-1" onClick={handleDecline}>
                <i className="bi bi-telephone-x-fill me-1"></i> Decline
              </Button>
            </div>
          </Toast.Body>
        </Toast>
      )}

      {acceptedCall && (
        <VideoCallModal
          show={true}
          onHide={() => setAcceptedCall(null)}
          mode="incoming"
          targetUserId={acceptedCall.callerId}
          targetName={acceptedCall.callerName}
          incomingOffer={acceptedCall.offer}
        />
      )}
    </>
  );
};

export default IncomingCallAlert;
