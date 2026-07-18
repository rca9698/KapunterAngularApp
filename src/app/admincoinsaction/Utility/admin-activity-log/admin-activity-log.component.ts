import { Component, OnInit } from '@angular/core';
import { apiService } from 'src/app/api.service';
import { ToastrService } from 'src/app/toastr/toastr.service';

type ActivityStatusFilter = 'InProgress' | 'Completed' | 'Failed' | 'All';
type ActivityActionFilter = 'All' | 'CreateAccount' | 'DeleteAccount' | 'DeleteUser' | 'AddUser';

interface AdminActivityRow {
  activityId: number;
  actionType: string;
  targetUserId: number | null;
  targetLabel: string;
  actorUserId: number;
  actorRoleSnapshot: string;
  authMethod: string;
  status: string;
  resultMessage: string;
  traceId: string;
  startedAtUtc: string;
  completedAtUtc: string;
}

@Component({
  selector: 'app-admin-activity-log',
  templateUrl: './admin-activity-log.component.html',
  styleUrls: ['./admin-activity-log.component.css', '../../shared/admin-listing.shared.css']
})
export class AdminActivityLogComponent implements OnInit {
  loading = false;
  search = '';
  /** Show in-progress + completed together by default; tabs narrow the view. */
  statusFilter: ActivityStatusFilter = 'All';
  actionFilter: ActivityActionFilter = 'All';

  rows: AdminActivityRow[] = [];
  counts = { inProgress: 0, completed: 0, failed: 0 };

  readonly statusTabs: Array<{ key: ActivityStatusFilter; label: string }> = [
    { key: 'InProgress', label: 'In Progress' },
    { key: 'Completed', label: 'Completed' },
    { key: 'Failed', label: 'Failed' },
    { key: 'All', label: 'All' }
  ];

  readonly actionOptions: Array<{ key: ActivityActionFilter; label: string }> = [
    { key: 'All', label: 'All actions' },
    { key: 'CreateAccount', label: 'Create account' },
    { key: 'DeleteAccount', label: 'Delete account' },
    { key: 'AddUser', label: 'Add user' },
    { key: 'DeleteUser', label: 'Delete user' }
  ];

  constructor(
    private api: apiService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  setStatusFilter(status: ActivityStatusFilter): void {
    this.statusFilter = status;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.getAdminActivities({
      status: this.statusFilter === 'All' ? undefined : this.statusFilter,
      actionType: this.actionFilter === 'All' ? undefined : this.actionFilter,
      search: this.search?.trim() || undefined,
      top: 200
    }).subscribe({
      next: (resp: any) => {
        this.loading = false;
        const status = resp?.returnStatus ?? resp?.ReturnStatus;
        if (status === -1) {
          this.rows = [];
          this.toaster.warning(resp?.returnMessage ?? resp?.ReturnMessage ?? 'Admin role is required.');
          return;
        }

        const list = resp?.returnList ?? resp?.ReturnList ?? [];
        this.rows = (Array.isArray(list) ? list : []).map((row: any) => ({
          activityId: Number(row.activityId ?? row.ActivityId ?? 0),
          actionType: String(row.actionType ?? row.ActionType ?? ''),
          targetUserId: row.targetUserId != null || row.TargetUserId != null
            ? Number(row.targetUserId ?? row.TargetUserId)
            : null,
          targetLabel: String(row.targetLabel ?? row.TargetLabel ?? ''),
          actorUserId: Number(row.actorUserId ?? row.ActorUserId ?? 0),
          actorRoleSnapshot: String(row.actorRoleSnapshot ?? row.ActorRoleSnapshot ?? ''),
          authMethod: String(row.authMethod ?? row.AuthMethod ?? ''),
          status: String(row.status ?? row.Status ?? ''),
          resultMessage: String(row.resultMessage ?? row.ResultMessage ?? ''),
          traceId: String(row.traceId ?? row.TraceId ?? ''),
          startedAtUtc: String(row.startedAtUtc ?? row.StartedAtUtc ?? ''),
          completedAtUtc: String(row.completedAtUtc ?? row.CompletedAtUtc ?? '')
        }));
        this.refreshCounts();
      },
      error: () => {
        this.loading = false;
        this.rows = [];
        this.toaster.warning('Unable to load admin activity log.');
      }
    });
  }

  private refreshCounts(): void {
    // Lightweight counts from the currently loaded page (not a separate API).
    this.counts = {
      inProgress: this.rows.filter(r => r.status === 'InProgress').length,
      completed: this.rows.filter(r => r.status === 'Completed').length,
      failed: this.rows.filter(r => r.status === 'Failed').length
    };
  }

  targetDisplay(row: AdminActivityRow): string {
    if (row.targetLabel?.trim()) {
      return row.targetLabel;
    }
    if (row.targetUserId != null && row.targetUserId > 0) {
      return 'User #' + row.targetUserId;
    }
    return '—';
  }

  statusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'inprogress':
        return 'activity-status activity-status-progress';
      case 'completed':
        return 'activity-status activity-status-done';
      case 'failed':
        return 'activity-status activity-status-failed';
      default:
        return 'activity-status';
    }
  }

  friendlyAction(actionType: string): string {
    switch (actionType) {
      case 'CreateAccount': return 'Create account';
      case 'DeleteAccount': return 'Delete account';
      case 'AddUser': return 'Add user';
      case 'DeleteUser': return 'Delete user';
      default: return actionType || '—';
    }
  }
}
