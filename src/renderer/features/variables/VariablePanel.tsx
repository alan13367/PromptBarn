import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { Copy, Wand2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { detectVariables, fillVariables } from '../../utils/variables';

interface VariablePanelProps {
  body: string;
  onNotice: (message: string) => void;
}

export function VariablePanel({ body, onNotice }: VariablePanelProps): ReactElement {
  const variables = useMemo(() => detectVariables(body), [body]);
  const [values, setValues] = useState<Record<string, string>>({});
  const finalPrompt = useMemo(() => fillVariables(body, values), [body, values]);

  const copy = async (text: string, message: string): Promise<void> => {
    await navigator.clipboard.writeText(text);
    onNotice(message);
  };

  return (
    <section className="flex min-h-0 flex-col border-t border-border/70 bg-card/70">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Wand2 className="h-4 w-4 text-primary" />
          Variables
        </div>
        <Button size="sm" onClick={() => copy(body, 'Raw prompt copied.')}>
          <Copy className="h-4 w-4" />
          Raw
        </Button>
      </div>
      <div className="grid min-h-0 grid-cols-[240px_1fr] gap-4 p-4">
        <div className="space-y-3 overflow-y-auto">
          {variables.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/80 bg-background/40 p-4 text-sm leading-6 text-muted-foreground">
              Add variables like <span className="font-mono text-foreground">{'{{topic}}'}</span> to generate fill-in fields.
            </div>
          ) : (
            variables.map((variable) => (
              <label key={variable} className="block text-xs font-medium text-muted-foreground">
                {variable}
                <Input
                  className="mt-1"
                  value={values[variable] ?? ''}
                  onChange={(event) => setValues((current) => ({ ...current, [variable]: event.target.value }))}
                />
              </label>
            ))
          )}
        </div>
        <div className="flex min-h-0 flex-col gap-3">
          <Textarea value={finalPrompt} readOnly className="min-h-[120px] flex-1 font-mono text-xs leading-5" />
          <Button variant="primary" onClick={() => copy(finalPrompt, 'Final prompt copied.')}>
            <Copy className="h-4 w-4" />
            Copy Final Prompt
          </Button>
        </div>
      </div>
    </section>
  );
}
