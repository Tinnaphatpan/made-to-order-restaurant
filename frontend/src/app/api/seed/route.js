import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const categories = [
  { name: 'อาหารจานหลัก', description: 'อาหารจานหลักประจำร้าน รสชาติต้นตำรับไทยและนานาชาติ', icon: '🍛' },
  { name: 'ของหวาน',       description: 'ของหวานหลากหลาย ทั้งไทยและเทศ หวานละมุนใจ',         icon: '🍮' },
  { name: 'เบเกอรี่',      description: 'เบเกอรี่อบสดใหม่ทุกวัน หอมกรุ่นตั้งแต่เช้า',        icon: '🥐' },
  { name: 'เครื่องดื่ม',   description: 'เครื่องดื่มร้อนและเย็น สดชื่นทุกแก้ว',              icon: '🧋' },
];

const menuItems = {
  'อาหารจานหลัก': [
    { name: 'ต้มยำกุ้ง',    description: 'ต้มยำกุ้งสูตรต้นตำรับ รสชาติจัดจ้านกลมกล่อม', price: 150, image: '/images/ต้มยำ.jpg',         preparationTime: 20, options: [{ label: 'ระดับความเผ็ด', choices: ['ไม่เผ็ด', 'เผ็ดน้อย', 'เผ็ดกลาง', 'เผ็ดมาก'] }] },
    { name: 'ข้าวผัดทะเล',  description: 'ข้าวผัดทะเลสดใหม่ กุ้ง หมึก และหอยแมลงภู่',   price: 120, image: '/images/ข้าวผัดทะเล.jpg',   preparationTime: 15, options: [{ label: 'ระดับความเผ็ด', choices: ['ไม่เผ็ด', 'เผ็ดน้อย', 'เผ็ดกลาง', 'เผ็ดมาก'] }] },
    { name: 'ผัดขี้เมาทะเล', description: 'ผัดขี้เมาทะเลรสจัดจ้าน หอมกลิ่นกะเพราสด',    price: 130, image: '/images/ผัดขี้เมาทะเล.jpg', preparationTime: 15, options: [{ label: 'ระดับความเผ็ด', choices: ['เผ็ดน้อย', 'เผ็ดกลาง', 'เผ็ดมาก', 'เผ็ดสุดๆ'] }] },
    { name: 'สเต็กเนื้อ',    description: 'สเต็กเนื้อออสเตรเลียคัดพิเศษ ย่างกระทะร้อน',   price: 280, image: '/images/สเต็ก.jpg',         preparationTime: 25, options: [{ label: 'ระดับสุก', choices: ['ดิบ (Rare)', 'กึ่งสุก (Medium)', 'สุกพอดี (Medium-Well)', 'สุกมาก (Well-Done)'] }] },
    { name: 'สลัดทูน่า',     description: 'สลัดทูน่าสดผสมผักกาดหอมกรอบ',                  price: 110, image: '/images/สลัดทูน่า.jpg',     preparationTime: 10, options: [{ label: 'น้ำสลัด', choices: ['ซีซาร์', 'พันเกาะ', 'บาลซามิก', 'ไม่ใส่น้ำสลัด'] }] },
    { name: 'ต้มจืดสาหร่าย', description: 'ต้มจืดสาหร่ายวากาเมะและเต้าหู้นุ่ม',            price: 90,  image: '/images/ต้มจืดสาหร่าย.jpg', preparationTime: 15 },
    { name: 'แกงไตปลา',      description: 'แกงไตปลาสูตรภาคใต้แท้ รสเข้มข้นเผ็ดร้อน',     price: 160, image: '/images/แกงไตปลา.jpg',     preparationTime: 20, options: [{ label: 'ระดับความเผ็ด', choices: ['เผ็ดน้อย', 'เผ็ดกลาง', 'เผ็ดมาก'] }] },
    { name: 'กะเพราหมูสับ',  description: 'กะเพราหมูสับรสจัดจ้าน ใส่ไข่ดาวกรอบ',          price: 85,  image: '/images/กระเพรา.avif',     preparationTime: 10, options: [{ label: 'ระดับความเผ็ด', choices: ['ไม่เผ็ด', 'เผ็ดน้อย', 'เผ็ดกลาง', 'เผ็ดมาก'] }] },
    { name: 'ผัดไทย',        description: 'ผัดไทยกุ้งสดสูตรต้นตำรับ เส้นเหนียวนุ่ม',      price: 100, image: '/images/ผัดไทย.avif',       preparationTime: 15 },
  ],
  'ของหวาน': [
    { name: 'ข้าวเหนียวมะม่วง', description: 'ข้าวเหนียวมูนมะม่วงน้ำดอกไม้ หอมหวาน',      price: 80,  image: '/images/ข้างเหนียวมะม่วง.jpg', preparationTime: 5 },
    { name: 'บัวลอย',           description: 'บัวลอยไข่หวานแบบโบราณ แป้งหนึบนุ่มหลากสี', price: 65,  image: '/images/บัวลอย.jpg',             preparationTime: 10 },
    { name: 'บานานอฟฟี่',       description: 'บานานอฟฟี่สไตล์โฮมเมด ฐานบิสกิตกรอบ',       price: 90,  image: '/images/บานานอฟฟี่.jpg',         preparationTime: 5 },
    { name: 'ชีสเค้ก',          description: 'นิวยอร์กชีสเค้กเนื้อเนียนนุ่ม หนาแน่น',      price: 120, image: '/images/ชีสเค้ก.jpg',             preparationTime: 5, options: [{ label: 'ซอสท็อปปิ้ง', choices: ['บลูเบอร์รี่', 'สตรอว์เบอร์รี่', 'คาราเมล', 'ไม่ใส่ซอส'] }] },
  ],
  'เบเกอรี่': [
    { name: 'ครัวซองเนยสด',  description: 'ครัวซองเนยแท้สูตรฝรั่งเศส กรอบนอกนุ่มใน', price: 55, image: '/images/ครัวซอง.jpg', preparationTime: 5 },
    { name: 'ครัวซองแฮมชีส', description: 'ครัวซองไส้แฮมควันเย็นและชีสเชดดาร์',       price: 75, image: '/images/แฮมชีส.jpg',   preparationTime: 10 },
  ],
  'เครื่องดื่ม': [
    { name: 'มัทฉะเพียว',  description: 'มัทฉะเกรดพรีเมียมจากอุจิ ประเทศญี่ปุ่น',  price: 85, image: '/images/มัทฉะเพียว.jpg',  preparationTime: 5, options: [{ label: 'อุณหภูมิ', choices: ['ร้อน', 'เย็น', 'ปั่น'] }] },
    { name: 'มัทฉะลาเต้',  description: 'มัทฉะลาเต้นมสดเข้มข้น ผสมมัทฉะพรีเมียม',  price: 95, image: '/images/มัทฉะลาเต้.jpg',  preparationTime: 5, options: [{ label: 'อุณหภูมิ', choices: ['ร้อน', 'เย็น', 'ปั่น'] }, { label: 'ระดับความหวาน', choices: ['ไม่หวาน', 'หวานน้อย', 'หวานปกติ', 'หวานมาก'] }] },
    { name: 'โกโก้',       description: 'โกโก้เข้มข้นจากเมล็ดโกโก้คัดพิเศษ',        price: 75, image: '/images/โกโก้.jpg',       preparationTime: 5, options: [{ label: 'อุณหภูมิ', choices: ['ร้อน', 'เย็น', 'ปั่น'] }] },
    { name: 'ชาไทย',       description: 'ชาไทยสูตรต้นตำรับ ชาอัสสัมเข้มข้น',        price: 65, image: '/images/ชาไทย.jpg',       preparationTime: 5, options: [{ label: 'อุณหภูมิ', choices: ['ร้อน', 'เย็น', 'ปั่น'] }] },
    { name: 'ชานม',        description: 'ชานมสูตรพิเศษ ชาอัสสัมเข้มผสมนมสด',        price: 70, image: '/images/ชานม.jpg',        preparationTime: 5, options: [{ label: 'อุณหภูมิ', choices: ['ร้อน', 'เย็น', 'ปั่น'] }, { label: 'ท็อปปิ้ง', choices: ['ไม่ใส่', 'ไข่มุกดำ', 'ไข่มุกทอง', 'วุ้นมะพร้าว'] }] },
  ],
};

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (body.confirm !== 'seed') {
      return NextResponse.json({ success: false, error: 'ส่ง { "confirm": "seed" } เพื่อยืนยัน' }, { status: 400 });
    }

    // ลบข้อมูลเดิม
    await prisma.menuItem.deleteMany({});
    await prisma.category.deleteMany({});

    // สร้างหมวดหมู่
    const createdCategories = {};
    for (const cat of categories) {
      const created = await prisma.category.create({ data: cat });
      createdCategories[cat.name] = created.id;
    }

    // สร้างเมนู
    let totalCreated = 0;
    for (const [categoryName, items] of Object.entries(menuItems)) {
      const categoryId = createdCategories[categoryName];
      for (const item of items) {
        await prisma.menuItem.create({ data: { ...item, categoryId } });
        totalCreated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seed สำเร็จ! สร้าง ${categories.length} หมวดหมู่ และ ${totalCreated} เมนู`,
      categories: categories.map(c => c.name),
      totalMenuItems: totalCreated,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
