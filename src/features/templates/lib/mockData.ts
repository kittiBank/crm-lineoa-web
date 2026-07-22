import { faker } from "@faker-js/faker";
import { MessageTemplate, TemplateCategory } from "../types";

/**
 * Generate mock message templates
 */
export function generateMockTemplates(count: number = 12): MessageTemplate[] {
  const categories = ["Promotion", "Welcome", "Support", "Notification", "Survey"];
  const templateTypes: MessageTemplate["type"][] = [
    "text",
    "flex",
    "carousel",
    "multi",
  ];

  return Array.from({ length: count }, () => {
    const createdDate = faker.date.past({ years: 1 }).toISOString();
    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.lorem.sentence(),
      type: faker.helpers.arrayElement(templateTypes),
      messages: [],
      createdAt: createdDate,
      updatedAt: faker.date.recent().toISOString(),
      category: faker.helpers.arrayElement(categories),
      usageCount: faker.number.int({ min: 0, max: 500 }),
      isActive: faker.datatype.boolean({ probability: 0.8 }),
    };
  });
}

/**
 * Generate template categories with counts
 */
export function generateTemplateCategories(
  templates: MessageTemplate[]
): TemplateCategory[] {
  const categoryCounts = templates.reduce(
    (acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(categoryCounts).map(([name, count]) => ({
    id: faker.string.uuid(),
    name,
    count,
  }));
}

/**
 * Filter templates by category
 */
export function filterTemplatesByCategory(
  templates: MessageTemplate[],
  category: string
): MessageTemplate[] {
  if (category === "All") return templates;
  return templates.filter((t) => t.category === category);
}

/**
 * Filter templates by status
 */
export function filterTemplatesByStatus(
  templates: MessageTemplate[],
  status: "active" | "inactive" | "all"
): MessageTemplate[] {
  if (status === "all") return templates;
  return templates.filter((t) =>
    status === "active" ? t.isActive : !t.isActive
  );
}

/**
 * Search templates
 */
export function searchTemplates(
  templates: MessageTemplate[],
  query: string
): MessageTemplate[] {
  if (!query) return templates;
  const lowerQuery = query.toLowerCase();
  return templates.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      (t.description ?? "").toLowerCase().includes(lowerQuery) ||
      t.category.toLowerCase().includes(lowerQuery),
  );
}
