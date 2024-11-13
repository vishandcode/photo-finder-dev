export const EmptyFieldHandler = (res, fields) => {
  for (const field in fields) {
    if (
      fields[field] === undefined ||
      fields[field] === null ||
      fields[field] === ""
    ) {
      return res.status(404).json({
        message: `Please provide '${field}' field`,
        type: "field_error",
      });
    }
  }
};
