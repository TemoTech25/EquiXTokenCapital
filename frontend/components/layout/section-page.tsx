import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SectionPage({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">
          This page is scaffolded and ready for feature implementation with API integrations and domain-specific UI widgets.
        </p>
      </CardContent>
    </Card>
  );
}
