export const generateFields = (columns: any): any[] => {
  const fields = [];
  columns.map((column) => generate(column.property, fields));
  return fields;
};

const generate = (root: string, fields: any = []) => {
  if (!root) {
    return [];
  }

  const paths = root.replace(/\[.*?\]/g, '').split('.');

  for (const part of paths) {
    if (paths.length === 1) {
      fields.push(part);
      return fields;
    }

    fields.push({
      [part]: [...generate(paths.splice(1).join('.'))],
    });

    return fields;
  }
};
