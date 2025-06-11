export function mapCondition(dbCondition: string): 'new' | 'used' | 'salvaged' | 'broken' {
  switch (dbCondition) {
    case 'new':
      return 'new';
    case 'refurbished':
      return 'used';
    case 'used':
      return 'used';
    case 'damaged':
      return 'broken';
    default:
      return 'used';
  }
}

export function mapConditionReverse(condition: string): string {
  switch (condition) {
    case 'new':
      return 'new';
    case 'used':
      return 'used';
    case 'salvaged':
      return 'used';
    case 'broken':
      return 'damaged';
    default:
      return 'used';
  }
}
