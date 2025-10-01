export type CalendarEvent = {
  id?: string;
  title: string;
  start: any;
  end?: any;
  allDay?: boolean;
  project?: string;
  projectName?: string;
  location?: string;
  description?: string;
  assignees?: { id: string; name?: string; avatar?: string }[];
  color?: string;
};
