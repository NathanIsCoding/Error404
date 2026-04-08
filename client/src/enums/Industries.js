const INDUSTRY_COLORS = {
    'Information Technology': '#5366d4',
    'Healthcare': '#2da882',
    'Education': '#3a8fd4',
    'Finance': '#c9a832',
    'Retail': '#e07a30',
    'Manufacturing': '#8a7560',
    'Construction': '#c4a020',
    'Hospitality': '#d45e8a',
    'Transportation and Logistics': '#30b8c4',
    'Sales': '#cc2d4d',
    'Marketing and Advertising': '#9b3dc8',
    'Customer Service': '#4aabdb',
    'Government and Public Administration': '#3a5fa0',
    'Engineering': '#4a8fa8',
    'Real Estate': '#a06830',
    'Media and Entertainment': '#c43ab8',
    'Telecommunications': '#2d9e8a',
    'Agriculture': '#5aa632',
    'Energy and Utilities': '#d48a20',
    'Legal Services': '#7040a8',
    default: '#53d4ab',
};

export const INDUSTRIES = Object.keys(INDUSTRY_COLORS).filter(k => k !== 'default');

export default INDUSTRY_COLORS