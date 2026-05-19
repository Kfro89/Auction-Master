import { motion } from 'framer-motion';

export const ChartTooltipContent = (props: any) => {
  const { active, payload, label, valueFormatter = (val: number) => `$${val.toLocaleString()}` } = props;
  if (active && payload && payload.length) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-container/80 backdrop-blur-xl border border-outline-variant/50 p-4 rounded-xl shadow-lg min-w-[140px]"
      >
        {label && <p className="text-xs uppercase font-semibold text-on-surface-variant mb-2 tracking-wider">{label}</p>}
        <div className="flex flex-col gap-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full shadow-sm" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-on-surface">
                  {entry.name}
                </span>
              </div>
              <span className="text-sm font-bold text-on-surface" style={{ color: entry.color }}>
                {valueFormatter(entry.value as number)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }
  return null;
};

export const ChartLegendContent = (props: any) => {
  const { payload } = props;
  
  return (
    <ul className="flex flex-wrap items-center justify-center gap-4 pt-4">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-[3px] shadow-sm" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium text-on-surface-variant">
            {entry.value}
          </span>
        </li>
      ))}
    </ul>
  );
};
