import { db } from '../config/database';
import { services } from '../models/schema';

const initialServices = [
    {
        nameEn: 'Initial consultation and treatment plan',
        nameRu: 'Первичная консультация и составление плана лечения',
        nameAm: 'Առաջնային խորհրդատվություն և բուժման պլանի կազմում',
        price: 5000,
        duration: 30,
    },
    {
        nameEn: 'Professional oral hygiene (AirFlow + Ultrasound)',
        nameRu: 'Профессиональная гигиена полости рта (AirFlow + Ультразвук)',
        nameAm: 'Բերանի խոռոչի պրոֆեսիոնալ հիգիենա (AirFlow + Ուլտրաձայն)',
        price: 25000,
        duration: 60,
    },
    {
        nameEn: 'Teeth whitening with Zoom 4',
        nameRu: 'Отбеливание зубов аппаратом Zoom 4',
        nameAm: 'Ատամների սպիտակեցում Zoom 4 ապարատով',
        price: 120000,
        duration: 90,
    },
    {
        nameEn: 'Treatment of superficial/moderate caries (1 tooth)',
        nameRu: 'Лечение поверхностного/среднего кариеса (1 зуб)',
        nameAm: 'Մակերեսային/միջին կարիեսի բուժում (1 ատամ)',
        price: 15000,
        duration: 45,
    },
    {
        nameEn: 'Endodontic treatment (root canal therapy, 1 canal)',
        nameRu: 'Эндодонтическое лечение (пульпит, 1 канал)',
        nameAm: 'Էնդոդոնտիկ բուժում (արմատախողովակի մշակում, 1 խողովակ)',
        price: 30000,
        duration: 60,
    },
    {
        nameEn: 'Simple tooth extraction',
        nameRu: 'Простое удаление зуба',
        nameAm: 'Ատամի պարզ հեռացում',
        price: 10000,
        duration: 30,
    },
    {
        nameEn: 'Complex tooth extraction (wisdom tooth)',
        nameRu: 'Сложное удаление зуба (зуб мудрости)',
        nameAm: 'Բարդ ատամի հեռացում (իմաստության ատամ)',
        price: 35000,
        duration: 90,
    },
    {
        nameEn: 'Implant placement (surgical stage)',
        nameRu: 'Установка имплантата (хирургический этап)',
        nameAm: 'Իմպլանտի տեղադրում (վիրաբուժական փուլ)',
        price: 150000,
        duration: 60,
    },
    {
        nameEn: 'Installation of a metal-ceramic crown',
        nameRu: 'Установка металлокерамической коронки',
        nameAm: 'Մետաղակերամիկական պսակի (կորոնկա) տեղադրում',
        price: 60000,
        duration: 120,
    },
    {
        nameEn: 'Installation of a zirconia crown',
        nameRu: 'Установка коронки из диоксида циркония',
        nameAm: 'Ցիրկոնիումի երկօքսիդից պսակի (կորոնկա) տեղադրում',
        price: 100000,
        duration: 120,
    },
    {
        nameEn: 'Ceramic veneer installation (1 tooth)',
        nameRu: 'Установка керамического винира (1 зуб)',
        nameAm: 'Կերամիկական վինիրի տեղադրում (1 ատամ)',
        price: 130000,
        duration: 120,
    },
    {
        nameEn: 'Installation of metal braces (one jaw)',
        nameRu: 'Установка металлической брекет-системы (одна челюсть)',
        nameAm: 'Մետաղական բրեկետ-համակարգի տեղադրում (մեկ ծնոտ)',
        price: 250000,
        duration: 90,
    }
];

const seedServices = async () => {
    console.log('🌱 Starting database seeding...');

    try {
        console.log('Clearing old services...');
        await db.delete(services);

        console.log('Inserting new dental services...');
        await db.insert(services).values(initialServices);

        console.log('✅ Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
};

seedServices();