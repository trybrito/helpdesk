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

export enum ObservationActionsLogs {
	Create = 'create',
	Update = 'update',
}

export enum ProfileActionTypes {
	Create = 'create',
	Update = 'update',
}

export enum BillingStatus {
	Open = 'open',
	Closed = 'closed',
	Cancelled = 'cancelled',
}
