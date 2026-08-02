import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Nav, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api, { resolveUploadUrl } from '../services/api';

const STATUS_VARIANT = { pending: 'warning', verified: 'success', rejected: 'danger' };

const AdminVerifications = () => {
  const [status, setStatus] = useState('pending');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null); // user currently open in the review modal
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/verifications', { params: { status } });
      setUsers(res.data.users);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openReview = (user) => {
    setSelected(user);
    setRejectionReason('');
  };

  const closeReview = () => setSelected(null);

  const decide = async (action) => {
    if (!selected) return;
    if (action === 'rejected' && !rejectionReason.trim()) {
      toast.error('Please give a reason for rejecting this user');
      return;
    }
    setActionLoading(true);
    try {
      await api.put(`/admin/verifications/${selected._id}`, {
        action,
        rejectionReason: action === 'rejected' ? rejectionReason.trim() : undefined
      });
      toast.success(action === 'verified' ? 'User approved' : 'User rejected');
      closeReview();
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const idDocIsImage = (path) => /\.(jpg|jpeg|png|webp)$/i.test(path || '');

  return (
    <Container className="py-4">
      <h3 className="fw-bold text-success mb-1">
        <i className="bi bi-shield-check me-2"></i>
        User ID Verification
      </h3>
      <p className="text-muted">Review the government ID document each user submitted and approve or reject their account.</p>

      <Nav variant="pills" className="mb-3 gap-2">
        {['pending', 'verified', 'rejected', 'all'].map((s) => (
          <Nav.Item key={s}>
            <Nav.Link active={status === s} onClick={() => setStatus(s)} className="rounded-pill px-3 text-capitalize">
              {s}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted py-5 mb-0">No users in this category.</p>
          ) : (
            <Table hover responsive className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th>Govt ID Type</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.mobile}</td>
                    <td className="text-capitalize">{u.role}</td>
                    <td className="text-capitalize">{(u.govtIdType || '-').replace('_', ' ')}</td>
                    <td>
                      <Badge bg={STATUS_VARIANT[u.isGovtIdVerified]} className="text-capitalize">
                        {u.isGovtIdVerified}
                      </Badge>
                    </td>
                    <td>
                      <Button size="sm" variant="outline-success" onClick={() => openReview(u)}>
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={!!selected} onHide={closeReview} size="lg" centered>
        {selected && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Verify {selected.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <p className="mb-1"><strong>Mobile:</strong> {selected.mobile}</p>
                  <p className="mb-1 text-capitalize"><strong>Role:</strong> {selected.role}</p>
                  <p className="mb-1 text-capitalize"><strong>Govt ID Type:</strong> {(selected.govtIdType || '-').replace('_', ' ')}</p>
                  <p className="mb-1"><strong>Govt ID Number:</strong> {selected.govtIdNumber || '-'}</p>
                  {selected.district && <p className="mb-1"><strong>District:</strong> {selected.district}</p>}
                  {selected.companyName && <p className="mb-1"><strong>Company:</strong> {selected.companyName}</p>}
                  <p className="mb-1">
                    <strong>Current status:</strong>{' '}
                    <Badge bg={STATUS_VARIANT[selected.isGovtIdVerified]} className="text-capitalize">
                      {selected.isGovtIdVerified}
                    </Badge>
                  </p>
                  {selected.rejectionReason && (
                    <Alert variant="danger" className="py-2 mt-2">
                      Previous rejection reason: {selected.rejectionReason}
                    </Alert>
                  )}
                </Col>
                <Col md={6}>
                  <p className="fw-bold mb-2">Submitted ID Document</p>
                  {!selected.govtIdDocument ? (
                    <Alert variant="secondary">No document uploaded yet.</Alert>
                  ) : idDocIsImage(selected.govtIdDocument) ? (
                    <a href={resolveUploadUrl(selected.govtIdDocument)} target="_blank" rel="noopener noreferrer">
                      <img
                        src={resolveUploadUrl(selected.govtIdDocument)}
                        alt="Government ID document"
                        className="img-fluid rounded border"
                      />
                    </a>
                  ) : (
                    <a
                      href={resolveUploadUrl(selected.govtIdDocument)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-secondary"
                    >
                      <i className="bi bi-file-earmark-pdf me-1"></i> View uploaded document
                    </a>
                  )}
                </Col>
              </Row>

              <Form.Group className="mt-3">
                <Form.Label>Rejection reason (required only if rejecting)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Document is blurry, ID number does not match, etc."
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={closeReview} disabled={actionLoading}>
                Close
              </Button>
              <Button variant="danger" onClick={() => decide('rejected')} disabled={actionLoading}>
                {actionLoading ? <Spinner size="sm" animation="border" /> : 'Reject'}
              </Button>
              <Button variant="success" onClick={() => decide('verified')} disabled={actionLoading}>
                {actionLoading ? <Spinner size="sm" animation="border" /> : 'Approve'}
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default AdminVerifications;
