export enum Role {
	Customer = 'customer',
	Technician = 'technician',
	Admin = 'admin',
}

export enum TicketStatus {
	Open = 'open',
	BeingHandled = 'being_handled',
	Closed = 'closed',
}

export enum TicketAssignmentStatus {
	Assigned = 'assigned',
	Pendent = 'pendent',
}

export enum ObservationLogsActions {
	Create = 'create',
	Update = 'update',
	Delete = 'delete',
}

export enum BillingStatus {
	Open = 'open',
	Closed = 'closed',
	Cancelled = 'cancelled',
}
