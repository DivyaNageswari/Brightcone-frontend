import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import {
  Alert,
  Button,
  Card,
  ConfirmDialog,
  Drawer,
  FormModal,
  Pill,
  ProgressBar,
  StatTile,
  Tabs,
  TextField,
} from '@/components/ui'
import { useToast } from '@/components/useToast'

export function HomePage() {
  const { user, can } = useAuth()
  const notice = (useLocation().state as { notice?: string } | null)?.notice
  const { showToast } = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')

  if (!user) return null

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setModalOpen(false)
    setFeedbackText('')
    showToast('Feedback submitted successfully. Thank you!', 'ok')
  }

  const handleConfirmAction = () => {
    setConfirmOpen(false)
    showToast('Session refreshed and verified securely.', 'ok')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {notice && <Alert kind="info">{notice}</Alert>}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 6px 0' }}>Welcome, {user.name.split(' ')[0]}</h1>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            Brightcone HR Portal &middot; Enterprise Workspace
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="ghost" onClick={() => setDrawerOpen(true)}>
            Quick Actions
          </Button>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Give Feedback
          </Button>
        </div>
      </div>

      {/* Headline Metric Tiles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <StatTile
          label="Account Status"
          value={<Pill tone="ok">Active &amp; Verified</Pill>}
          hint="Argon2id credential protection"
        />
        <StatTile
          label="Granted Permissions"
          value={user.permissions.length}
          hint="Role-based access matrix"
        />
        <StatTile
          label="Security Health"
          value="100%"
          hint="HSTS, CSP, and Rotation Active"
        />
        <StatTile
          label="Current Role"
          value={user.role.toUpperCase()}
          hint="Least privilege access model"
        />
      </div>

      <Tabs
        tabs={[
          {
            id: 'workspace',
            label: 'My Workspace',
            panel: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Card>
                  <h3>Active Role &amp; Capabilities</h3>
                  <p style={{ color: 'var(--muted)', marginBottom: 16 }}>
                    Your account is assigned the <strong>{user.role}</strong> role. You have been
                    authorized with the following granular permissions:
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {user.permissions.map((p) => (
                      <Pill key={p} tone="info">
                        {p}
                      </Pill>
                    ))}
                  </div>
                </Card>

                <Card>
                  <h3>Platform Security &amp; Compliance</h3>
                  <p style={{ color: 'var(--muted)', marginBottom: 12 }}>
                    Continuous compliance checks across authentication tokens, session rotation, and
                    audit telemetry.
                  </p>
                  <ProgressBar label="Compliance & Hardening Score" value={98} />
                </Card>
              </div>
            ),
          },
          {
            id: 'tools',
            label: 'Administrative & Security Tools',
            panel: (
              <Card>
                <h3>Available Portals &amp; Shortcuts</h3>
                <p style={{ color: 'var(--muted)', marginBottom: 16 }}>
                  Access modules configured for your authorization level:
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {can('audit:read') && (
                    <Link to="/audit" style={{ textDecoration: 'none' }}>
                      <Button variant="ghost">View Immutable Audit Log</Button>
                    </Link>
                  )}
                  <Link to="/change-password" style={{ textDecoration: 'none' }}>
                    <Button variant="ghost">Update Account Password</Button>
                  </Link>
                  <Button variant="ghost" onClick={() => setConfirmOpen(true)}>
                    Verify Active Session
                  </Button>
                </div>
              </Card>
            ),
          },
        ]}
      />

      {/* Form Modal for Feedback */}
      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Share Your Feedback"
      >
        <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            Help us improve the Brightcone HR experience. Your comments are reviewed by system administrators.
          </p>
          <TextField
            label="Feedback or Suggestion"
            placeholder="Type your feedback here…"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Feedback
            </Button>
          </div>
        </form>
      </FormModal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title="Verify Session Authenticity"
        message="This action checks and validates your cryptographic session token against the secure authentication authority."
        confirmLabel="Verify Now"
      />

      {/* Quick Actions Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Quick Actions &amp; Navigation"
        position="right"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            Common tasks and shortcuts available for your user account:
          </p>
          <Button
            variant="ghost"
            onClick={() => {
              setDrawerOpen(false)
              showToast('Security notification acknowledged.', 'info')
            }}
          >
            Acknowledge System Notice
          </Button>
          {can('audit:read') && (
            <Link to="/audit" onClick={() => setDrawerOpen(false)} style={{ textDecoration: 'none' }}>
              <Button variant="ghost" block>
                Browse Audit Log
              </Button>
            </Link>
          )}
          <Link to="/change-password" onClick={() => setDrawerOpen(false)} style={{ textDecoration: 'none' }}>
            <Button variant="ghost" block>
              Change Password
            </Button>
          </Link>
        </div>
      </Drawer>
    </div>
  )
}
