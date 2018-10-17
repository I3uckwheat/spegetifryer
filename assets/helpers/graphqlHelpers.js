const {
  GraphQLInt,
  GraphQLString,
  GraphQLFloat,
  GraphQLBoolean
} = require('graphql')

const typeCrossReference = {
  GraphQLInt,
  GraphQLString,
  GraphQLFloat,
  GraphQLBoolean
}

exports.buildColumnFields = (columns) => {
  return Object.entries(columns).reduce((acc, [column, dataType]) => {
    acc[column] = {
      // description: "string",
      type: typeCrossReference[dataType],
    };
    return acc;
  }, {});
};

exports.getArgsByColumns = (columns) => {
  return Object.entries(columns).reduce((acc, [column, type]) => {
    acc[column] = { type: typeCrossReference[type] };
    return acc;
  }, {});
}

/**
 * Build a conditions string, given a set of arguments
 * Useful for WHERE and JOIN ... ON clauses, etc
 */
exports.buildConditionsByArgs = (args) => {
  return Object
    .entries(args)
    // filter out arguments that aren't a SQL condition
    .filter(([column, value]) => !['by'].includes(column))
    // convert the args to a conditions string
    .map(([column, value]) => {

      // add support for advanced WHERE syntax
      if (column === 'where') {
        return value;
      }

      // if it didn't match an advanced arg type, assume it's a table column
      // TODO: prevent SQL injection here & escape necessary characters
      return `${column} = '${value}'`;
    })
    // turn the array into a string of conditions
    .join(" AND ");
};

exports.buildSqlOrderBy = (args) => {
  if (!args.by) return null;

  return args.by
    .split(', ')
    .reduce((acc, predicate) => {
      const [column, direction] = predicate.split(" ");
      acc[column] = direction;

      return acc; 
    }, {});
};
