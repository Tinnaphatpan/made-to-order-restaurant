import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// อ่าน .env.local
const envPath = resolve(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const MONGODB_URI = envContent.match(/MONGODB_URI=(.+)/)?.[1]?.trim();

if (!MONGODB_URI) {
  console.error('ไม่พบ MONGODB_URI ใน .env.local');
  process.exit(1);
}

// ── Schemas ──────────────────────────────────────────────
const CategorySchema = new mongoose.Schema(
  { name: String, description: String, icon: String, isActive: { type: Boolean, default: true } },
  { timestamps: true }
);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

const MenuItemSchema = new mongoose.Schema(
  {
    name: String, description: String, price: Number,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    image: String, isAvailable: { type: Boolean, default: true },
    preparationTime: { type: Number, default: 15 },
    options: [{ label: String, choices: [String] }],
  },
  { timestamps: true }
);
const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);

// ── Data ──────────────────────────────────────────────────
const categories = [
  { name: 'อาหารจานหลัก', description: 'อาหารจานหลักประจำร้าน รสชาติต้นตำรับไทยและนานาชาติ', icon: '🍛' },
  { name: 'ของหวาน',       description: 'ของหวานหลากหลาย ทั้งไทยและเทศ หวานละมุนใจ',         icon: '🍮' },
  { name: 'เบเกอรี่',      description: 'เบเกอรี่อบสดใหม่ทุกวัน หอมกรุ่นตั้งแต่เช้า',        icon: '🥐' },
  { name: 'เครื่องดื่ม',   description: 'เครื่องดื่มร้อนและเย็น สดชื่นทุกแก้ว',              icon: '🧋' },
];

const menuItems = {
  'อาหารจานหลัก': [
    {
      name: 'ต้มยำกุ้ง',
      description: 'ต้มยำกุ้งสูตรต้นตำรับ รสชาติจัดจ้านกลมกล่อม หอมกลิ่นข่า ตะไคร้ และใบมะกรูด กุ้งสดตัวโต เนื้อหวานกรุบ เสิร์ฟพร้อมน้ำซุปเข้มข้น',
      price: 150, image: '/images/ต้มยำ.jpg', preparationTime: 20,
      options: [{ label: 'ระดับความเผ็ด', choices: ['ไม่เผ็ด', 'เผ็ดน้อย', 'เผ็ดกลาง', 'เผ็ดมาก'] }],
    },
    {
      name: 'ข้าวผัดทะเล',
      description: 'ข้าวผัดทะเลสดใหม่ กุ้ง หมึก และหอยแมลงภู่ ผัดกับไข่ไก่และผักสด ปรุงรสด้วยซีอิ๊วขาวและน้ำมันหอย หอมกลิ่นไฟแรง',
      price: 120, image: '/images/ข้าวผัดทะเล.jpg', preparationTime: 15,
      options: [{ label: 'ระดับความเผ็ด', choices: ['ไม่เผ็ด', 'เผ็ดน้อย', 'เผ็ดกลาง', 'เผ็ดมาก'] }],
    },
    {
      name: 'ผัดขี้เมาทะเล',
      description: 'ผัดขี้เมาทะเลรสจัดจ้าน หอมกลิ่นกะเพราสด ผสมกุ้ง หมึก และหอย ใส่พริกสดและพริกขี้หนู เสิร์ฟพร้อมข้าวสวยร้อนๆ',
      price: 130, image: '/images/ผัดขี้เมาทะเล.jpg', preparationTime: 15,
      options: [{ label: 'ระดับความเผ็ด', choices: ['เผ็ดน้อย', 'เผ็ดกลาง', 'เผ็ดมาก', 'เผ็ดสุดๆ'] }],
    },
    {
      name: 'สเต็กเนื้อ',
      description: 'สเต็กเนื้อออสเตรเลียคัดพิเศษ ย่างกระทะร้อนได้ระดับที่ต้องการ เสิร์ฟพร้อมซอสพริกไทยดำ มันฝรั่งบด และผักอบเนย',
      price: 280, image: '/images/สเต็ก.jpg', preparationTime: 25,
      options: [{ label: 'ระดับสุก', choices: ['ดิบ (Rare)', 'กึ่งสุก (Medium)', 'สุกพอดี (Medium-Well)', 'สุกมาก (Well-Done)'] }],
    },
    {
      name: 'สลัดทูน่า',
      description: 'สลัดทูน่าสดผสมผักกาดหอมกรอบ มะเขือเทศเชอร์รี่ แตงกวา ข้าวโพดหวาน ราดน้ำสลัดซีซาร์ครีมมี่ โรยชีสพาร์เมซาน',
      price: 110, image: '/images/สลัดทูน่า.jpg', preparationTime: 10,
      options: [{ label: 'น้ำสลัด', choices: ['ซีซาร์', 'พันเกาะ', 'บาลซามิก', 'ไม่ใส่น้ำสลัด'] }],
    },
    {
      name: 'ต้มจืดสาหร่าย',
      description: 'ต้มจืดสาหร่ายวากาเมะและเต้าหู้นุ่ม น้ำซุปใสหอมกลิ่นพริกไทยขาวและกระดูกหมู เบาสบายท้อง เหมาะสำหรับคนรักสุขภาพ',
      price: 90, image: '/images/ต้มจืดสาหร่าย.jpg', preparationTime: 15,
    },
    {
      name: 'แกงไตปลา',
      description: 'แกงไตปลาสูตรภาคใต้แท้ รสเข้มข้นเผ็ดร้อน หอมกลิ่นไตปลา ใส่ฟักทอง มะเขือ และถั่วฝักยาว เสิร์ฟพร้อมข้าวสวย',
      price: 160, image: '/images/แกงไตปลา.jpg', preparationTime: 20,
      options: [{ label: 'ระดับความเผ็ด', choices: ['เผ็ดน้อย', 'เผ็ดกลาง', 'เผ็ดมาก'] }],
    },
  ],
  'ของหวาน': [
    {
      name: 'ข้าวเหนียวมะม่วง',
      description: 'ข้าวเหนียวมูนมะม่วงน้ำดอกไม้ หอมหวานหนุบหนับ ราดกะทิสดข้นมัน โรยงาขาวคั่ว คู่กับมะม่วงน้ำดอกไม้สุกหวานฉ่ำ',
      price: 80, image: '/images/ข้างเหนียวมะม่วง.jpg', preparationTime: 5,
    },
    {
      name: 'บัวลอย',
      description: 'บัวลอยไข่หวานแบบโบราณ แป้งหนึบนุ่มหลากสีสัน ลอยในน้ำกะทิอุ่นหวานละมุน หอมกลิ่นใบเตยและมะพร้าวอ่อน',
      price: 65, image: '/images/บัวลอย.jpg', preparationTime: 10,
    },
    {
      name: 'บานานอฟฟี่',
      description: 'บานานอฟฟี่สไตล์โฮมเมด ฐานบิสกิตกรอบ ชั้นคาราเมลทอฟฟี่นุ่มหวาน กล้วยหอมสไลด์ และวิปครีมสดโรยผงโกโก้',
      price: 90, image: '/images/บานานอฟฟี่.jpg', preparationTime: 5,
    },
    {
      name: 'ชีสเค้ก',
      description: 'นิวยอร์กชีสเค้กเนื้อเนียนนุ่ม หนาแน่น หอมกลิ่นครีมชีสเต็มๆ บนฐานบิสกิตกรอบ เสิร์ฟพร้อมซอสบลูเบอร์รี่หรือสตรอว์เบอร์รี่',
      price: 120, image: '/images/ชีสเค้ก.jpg', preparationTime: 5,
      options: [{ label: 'ซอสท็อปปิ้ง', choices: ['บลูเบอร์รี่', 'สตรอว์เบอร์รี่', 'คาราเมล', 'ไม่ใส่ซอส'] }],
    },
  ],
  'เบเกอรี่': [
    {
      name: 'ครัวซองเนยสด',
      description: 'ครัวซองเนยแท้สูตรฝรั่งเศส อบสดใหม่ทุกเช้า กรอบนอกนุ่มชั้นในเป็นชั้นๆ หอมกลิ่นเนยละมุนจมูก เหมาะเป็นอาหารเช้าหรือของว่าง',
      price: 55, image: '/images/ครัวซอง.jpg', preparationTime: 5,
    },
    {
      name: 'ครัวซองแฮมชีส',
      description: 'ครัวซองไส้แฮมควันเย็นและชีสเชดดาร์ละลาย อบร้อนหอมกรุ่น ชั้นแป้งกรอบหอมเนย ไส้ฉ่ำมัน เสิร์ฟพร้อมซอสมัสตาร์ดหวาน',
      price: 75, image: '/images/แฮมชีส.jpg', preparationTime: 10,
    },
  ],
  'เครื่องดื่ม': [
    {
      name: 'มัทฉะเพียว',
      description: 'มัทฉะเกรดพรีเมียมจากอุจิ ประเทศญี่ปุ่น ชงด้วยน้ำอุณหภูมิที่เหมาะสม สีเขียวสดใส รสขมอมหวาน หอมชาเขียวแท้ๆ',
      price: 85, image: '/images/มัทฉะเพียว.jpg', preparationTime: 5,
      options: [{ label: 'อุณหภูมิ', choices: ['ร้อน', 'เย็น', 'ปั่น'] }],
    },
    {
      name: 'มัทฉะลาเต้',
      description: 'มัทฉะลาเต้นมสดเข้มข้น ผสมมัทฉะพรีเมียมกับนมสดออร์แกนิก หวานละมุน สีเขียวสวยงาม ท็อปด้วยฟองนมนุ่ม',
      price: 95, image: '/images/มัทฉะลาเต้.jpg', preparationTime: 5,
      options: [{ label: 'อุณหภูมิ', choices: ['ร้อน', 'เย็น', 'ปั่น'] }, { label: 'ระดับความหวาน', choices: ['ไม่หวาน', 'หวานน้อย', 'หวานปกติ', 'หวานมาก'] }],
    },
    {
      name: 'โกโก้',
      description: 'โกโก้เข้มข้นจากเมล็ดโกโก้คัดพิเศษ ผสมนมสดและน้ำตาลทรายแดง หอมหวานละมุน เสิร์ฟร้อนหรือเย็นบนก้อนน้ำแข็งใส',
      price: 75, image: '/images/โกโก้.jpg', preparationTime: 5,
      options: [{ label: 'อุณหภูมิ', choices: ['ร้อน', 'เย็น', 'ปั่น'] }, { label: 'ระดับความหวาน', choices: ['ไม่หวาน', 'หวานน้อย', 'หวานปกติ', 'หวานมาก'] }],
    },
    {
      name: 'ชาไทย',
      description: 'ชาไทยสูตรต้นตำรับ ชาอัสสัมเข้มข้นหอมกลิ่นดอกไม้ ผสมนมข้นหวานและนมสด สีส้มสวยงาม หวานมันถูกใจทุกวัย',
      price: 65, image: '/images/ชาไทย.jpg', preparationTime: 5,
      options: [{ label: 'อุณหภูมิ', choices: ['ร้อน', 'เย็น', 'ปั่น'] }, { label: 'ระดับความหวาน', choices: ['ไม่หวาน', 'หวานน้อย', 'หวานปกติ', 'หวานมาก'] }],
    },
    {
      name: 'ชานม',
      description: 'ชานมสูตรพิเศษ ชาอัสสัมเข้มผสมนมสดออร์แกนิก หอมละมุน หวานพอดี สามารถเพิ่มไข่มุกหรือเยลลี่ตามต้องการ',
      price: 70, image: '/images/ชานม.jpg', preparationTime: 5,
      options: [{ label: 'อุณหภูมิ', choices: ['ร้อน', 'เย็น', 'ปั่น'] }, { label: 'ท็อปปิ้ง', choices: ['ไม่ใส่', 'ไข่มุกดำ', 'ไข่มุกทอง', 'วุ้นมะพร้าว'] }],
    },
  ],
};

// ── Run ───────────────────────────────────────────────────
async function seed() {
  console.log('🔌 กำลังเชื่อมต่อ MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ เชื่อมต่อสำเร็จ');

  console.log('🗑️  ลบข้อมูลเดิม...');
  await MenuItem.deleteMany({});
  await Category.deleteMany({});

  console.log('📁 สร้างหมวดหมู่...');
  const catMap = {};
  for (const cat of categories) {
    const created = await Category.create(cat);
    catMap[cat.name] = created._id;
    console.log(`   ✔ ${cat.icon} ${cat.name}`);
  }

  console.log('🍽️  สร้างเมนูอาหาร...');
  let total = 0;
  for (const [catName, items] of Object.entries(menuItems)) {
    for (const item of items) {
      await MenuItem.create({ ...item, category: catMap[catName] });
      console.log(`   ✔ ${item.name} — ${item.price} ฿`);
      total++;
    }
  }

  console.log(`\n🎉 Seed สำเร็จ! สร้าง ${categories.length} หมวดหมู่ และ ${total} เมนู`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed ล้มเหลว:', err.message);
  process.exit(1);
});
