import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const databaseId = process.env.NOTION_DATABASE_ID;

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: 'date',
          direction: 'descending',
        },
      ],
    });

    const artworks = response.results.map((page, index) => {
      const props = page.properties;
      return {
        id: index + 1,
        title: props.title?.title[0]?.plain_text || '未命名作品',
        enTitle: props.enTitle?.rich_text[0]?.plain_text || '',
        imageUrl: props.imageUrl?.url || '',
        author: props.author?.rich_text[0]?.plain_text || '五月糖',
        date: props.date?.rich_text[0]?.plain_text || props.date?.date?.start || '2025.01.01',
        description: props.description?.rich_text[0]?.plain_text || '',
        tags: props.tags?.multi_select.map((tag) => tag.name) || [],
      };
    });

    res.status(200).json(artworks);
  } catch (error) {
    console.error("Notion API Error:", error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
