import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else if (diffInHours < 168) { // 7 days
    return format(date, 'EEEE');
  } else {
    return format(date, 'MMM d, yyyy');
  }
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const groupQueriesByDate = (queries) => {
  const groups = {};
  
  queries.forEach(query => {
    const date = new Date(query.created_at);
    const dateKey = format(date, 'yyyy-MM-dd');
    
    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: dateKey,
        displayDate: format(date, 'MMMM d, yyyy'),
        queries: []
      };
    }
    
    groups[dateKey].queries.push(query);
  });
  
  return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
};