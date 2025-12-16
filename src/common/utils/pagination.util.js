export const buildPaginationResponse = (data, total, page, limit) => {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      lastPage: Math.max(1, Math.ceil(total / limit)),
    },
  };
};