import { Separator } from "@/components/ui/separator"

type LabelCardProps = {
  id: string;
  name: string;
};

export function LabelCard({ id, name }: LabelCardProps) {
  return (
    <div className="label-card mx-auto flex h-[110px] w-full max-w-[70%] flex-col items-center justify-center rounded-lg border border-2 border-dashed border-muted-foreground bg-card p-2 text-card-foreground">
        <p className="text-[15px] text-primary font-bold mb-1">Presented to</p>
        <Separator className="my-1 w-10 bg-primary/50" />
        <div className="w-full text-center px-1 flex-1 flex items-center justify-center">
          <h2 className="text-4xl font-bold leading-tight tracking-wide break-words name-text text-[#0c2e42] text-center">{name}</h2>
        </div>
        <p className="font-mono text-[13px] text-muted-foreground/60 mt-1">{id}</p>
    </div>
  );
}
