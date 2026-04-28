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
  const hasEnteredValues = Object.values(values).some((value) => value.trim().length > 0);

  const copy = async (text: string, message: string): Promise<void> => {
    await navigator.clipboard.writeText(text);
    onNotice(message);
  };

  if (variables.length === 0) {
    return <></>;
  }

  return (
    <section className="flex min-h-0 flex-col rounded-lg border border-border/70 bg-card/70">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          <div>
            <div className="text-sm font-semibold">Variables</div>
            <div className="text-xs text-muted-foreground">Fill placeholders detected in the prompt body.</div>
          </div>
        </div>
        <Button size="sm" title="Copy raw prompt" onClick={() => copy(body, 'Raw prompt copied.')}>
          <Copy className="h-4 w-4" />
          Raw
        </Button>
      </div>
      <div className="grid min-h-0 grid-cols-[240px_1fr] gap-4 p-4">
        <div className="space-y-3 overflow-y-auto">
          {variables.map((variable) => (
            <label key={variable} className="block text-xs font-medium text-muted-foreground">
              {variable}
              <Input
                className="mt-1"
                value={values[variable] ?? ''}
                onChange={(event) => setValues((current) => ({ ...current, [variable]: event.target.value }))}
              />
            </label>
          ))}
        </div>
        {hasEnteredValues ? (
          <div className="flex min-h-0 flex-col gap-3">
            <div>
              <div className="text-sm font-semibold">Final Prompt Preview</div>
              <div className="mt-1 text-xs text-muted-foreground">Generated from the values entered here.</div>
            </div>
            <Textarea value={finalPrompt} readOnly className="min-h-[160px] flex-1 font-mono text-xs leading-5" />
            <Button variant="primary" onClick={() => copy(finalPrompt, 'Final prompt copied.')}>
              <Copy className="h-4 w-4" />
              Copy Final Prompt
            </Button>
          </div>
        ) : (
          <div className="flex min-h-[160px] items-center justify-center rounded-md border border-dashed border-border/80 bg-background/40 p-4 text-center text-sm leading-6 text-muted-foreground">
            Enter a variable value to preview the final prompt.
          </div>
        )}
      </div>
    </section>
  );
}
