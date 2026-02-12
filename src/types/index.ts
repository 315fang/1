export interface Photo {
    id: number;
    title: string;
    enTitle: string; // Backend sends en_title, we might need to map it or use en_title consistency. Let's stick to what App.tsx uses: enTitle. Backend sends en_title. I'll handle mapping in service.
    // Actually, to make it easier, let's match backend response or map it.
    // Backend API returns: id, title, en_title, image_url, description, date, tags (array)
    // App.tsx uses: id, title, enTitle, imageUrl, author, date, description, tags

    // Let's define the Raw type from API and the Transformed type for App
    // Actually, I'll update the components to use the new naming convention if possible, or map in the service.
    // Mapping in service is better to minimize changes to existing components.

    enTitle?: string;
    imageUrl: string;
    author?: string; // Profile might have this? Or just hardcode/remove as per requirement.
    date: string;
    description: string;
    tags: string[];
}

export interface Profile {
    id: number;
    name1: string;
    name2: string;
    avatar1: string;
    avatar2: string;
    together_date: string;
    site_title: string;
    bio: string;
    together_days: number;
}

export interface TimelineEvent {
    id: number;
    title: string;
    description: string;
    date: string;
    icon: string;
    photo_id: number | null;
}
