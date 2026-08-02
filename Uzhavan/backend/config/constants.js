// All 38 districts of Tamil Nadu
const TN_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
  'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
  'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
  'Vellore', 'Viluppuram', 'Virudhunagar'
];

// Product categories
const PRODUCT_CATEGORIES = [
  { key: 'cereals', en: 'Cereals', ta: 'தானியங்கள்' },
  { key: 'pulses', en: 'Pulses', ta: 'பருப்பு வகைகள்' },
  { key: 'vegetables', en: 'Vegetables', ta: 'காய்கறிகள்' },
  { key: 'fruits', en: 'Fruits', ta: 'பழங்கள்' },
  { key: 'spices', en: 'Spices', ta: 'மசாலா பொருட்கள்' },
  { key: 'oilseeds', en: 'Oilseeds', ta: 'எண்ணெய் வித்துக்கள்' },
  { key: 'flowers', en: 'Flowers', ta: 'பூக்கள்' },
  { key: 'dairy', en: 'Dairy', ta: 'பால் பொருட்கள்' },
  { key: 'others', en: 'Others', ta: 'மற்றவை' }
];

const CATEGORY_KEYS = PRODUCT_CATEGORIES.map(c => c.key);

module.exports = { TN_DISTRICTS, PRODUCT_CATEGORIES, CATEGORY_KEYS };
