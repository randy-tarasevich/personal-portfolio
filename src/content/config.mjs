import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.string(),
    readingTime: z.number().optional(),
  }),
})

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    imagePlaceholder: z.string().optional(),
    href: z.string().url().optional(),
    status: z.string(),
    tags: z.array(z.string()),
    order: z.number(),
    accent: z.enum(['blue', 'pink', 'purple']).optional(),
  }),
})

export const collections = {
  blog,
  projects,
}
