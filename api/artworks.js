import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  const apiKey = process.env.NOTION_API_KEY;
  const dbId = process.env.NOTION_DATABASE_ID;
  console.log("检查环境:", { 
    hasApiKey: !!apiKey, 
    apiKeyPrefix: apiKey ? apiKey.substring(0, 5) : 'NONE', 
    dbId: dbId 
  });

  const notion = new Client({ auth: apiKey });

  try {
    if (!notion.databases || typeof notion.databases.query !== 'function') {
      throw new Error(`Notion 客户端初始化异常: notion.databases=${typeof notion.databases}`);
    }

    const response = await notion.databases.query({ 
      database_id: dbId,
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
        title: props.title?.title?.[0]?.plain_text || '无标题', 
        enTitle: props.enTitle?.rich_text?.[0]?.plain_text || '', 
        imageUrl: props.imageUrl?.url || '', 
        author: props.author?.rich_text?.[0]?.plain_text || '五月糖', 
        date: props.date?.date?.start || props.date?.rich_text?.[0]?.plain_text || '2025', 
        description: props.description?.rich_text?.[0]?.plain_text || '', 
        tags: props.tags?.multi_select?.map((tag) => tag.name) || [], 
      }; 
    }); 

    res.status(200).json(artworks); 

  } catch (error) { 
    console.error("服务端详细报错:", error); 
    res.status(500).json({ 
      error: 'Failed to fetch data', 
      details: error.message 
    }); 
  } 
}
