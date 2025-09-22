import { AgeCategory } from "./types";

export const AGE_CATEGORIES: AgeCategory[] = [
    { id: "sub_junior_boys", name: "Sub-Junior Boys", description: "Age: 12-14 Years" },
    { id: "sub_junior_girls", name: "Sub-Junior Girls", description: "Age: 12-14 Years" },
    { id: "cadet_boys", name: "Cadet Boys", description: "Age: 15-17 Years" },
    { id: "cadet_girls", name: "Cadet Girls", description: "Age: 15-17 Years" },
    { id: "junior_boys", name: "Junior Boys", description: "Age: 18-20 Years" },
    { id: "junior_girls", name: "Junior Girls", description: "Age: 18-20 Years" },
    { id: "senior_boys", name: "Senior Boys", description: "Age: 21+ Years" },
    { id: "senior_girls", name: "Senior Girls", description: "Age: 21+ Years" },
];

export const WEIGHT_CATEGORIES = {
    sub_junior_boys: [
        { id: "sjb_u16", name: "Under 16", description: "Weight: Up to 16kg" },
        { id: "sjb_u18", name: "Under 18", description: "Weight: 16kg to 18kg" },
        { id: "sjb_u21", name: "Under 21", description: "Weight: 18kg to 21kg" },
        { id: "sjb_u23", name: "Under 23", description: "Weight: 21kg to 23kg" },
        { id: "sjb_u25", name: "Under 25", description: "Weight: 23kg to 25kg" },
        { id: "sjb_u27", name: "Under 27", description: "Weight: 25kg to 27kg" },
        { id: "sjb_u29", name: "Under 29", description: "Weight: 27kg to 29kg" },
        { id: "sjb_u32", name: "Under 32", description: "Weight: 29kg to 32kg" },
        { id: "sjb_u35", name: "Under 35", description: "Weight: 32kg to 35kg" },
        { id: "sjb_u38", name: "Under 38", description: "Weight: 35kg to 38kg" },
        { id: "sjb_u41", name: "Under 41", description: "Weight: 38kg to 41kg" },
        { id: "sjb_u44", name: "Under 44", description: "Weight: 41kg to 44kg" },
        { id: "sjb_u50", name: "Under 50", description: "Weight: 44kg to 50kg" },
        { id: "sjb_o50", name: "Over 50", description: "Weight: 50kg+" },
    ],
    sub_junior_girls: [
        { id: "sjg_u14", name: "Under 14", description: "Weight: Up to 14kg" },
        { id: "sjg_u16", name: "Under 16", description: "Weight: 14kg to 16kg" },
        { id: "sjg_u18", name: "Under 18", description: "Weight: 16kg to 18kg" },
        { id: "sjg_u20", name: "Under 20", description: "Weight: 18kg to 20kg" },
        { id: "sjg_u22", name: "Under 22", description: "Weight: 20kg to 22kg" },
        { id: "sjg_u24", name: "Under 24", description: "Weight: 22kg to 24kg" },
        { id: "sjg_u26", name: "Under 26", description: "Weight: 24kg to 26kg" },
        { id: "sjg_u29", name: "Under 29", description: "Weight: 26kg to 29kg" },
        { id: "sjg_u32", name: "Under 32", description: "Weight: 29kg to 32kg" },
        { id: "sjg_u35", name: "Under 35", description: "Weight: 32kg to 35kg" },
        { id: "sjg_u38", name: "Under 38", description: "Weight: 35kg to 38kg" },
        { id: "sjg_u41", name: "Under 41", description: "Weight: 38kg to 41kg" },
        { id: "sjg_u47", name: "Under 47", description: "Weight: 41kg to 47kg" },
        { id: "sjg_o47", name: "Over 47", description: "Weight: 47kg+" },
    ],
    cadet_boys: [
        { id: "cb_u33", name: "Under 33", description: "Weight: Up to 33kg" },
        { id: "cb_u37", name: "Under 37", description: "Weight: 33kg to 37kg" },
        { id: "cb_u41", name: "Under 41", description: "Weight: 37kg to 41kg" },
        { id: "cb_u45", name: "Under 45", description: "Weight: 41kg to 45kg" },
        { id: "cb_u49", name: "Under 49", description: "Weight: 45kg to 49kg" },
        { id: "cb_u53", name: "Under 53", description: "Weight: 49kg to 53kg" },
        { id: "cb_u57", name: "Under 57", description: "Weight: 53kg to 57kg" },
        { id: "cb_u61", name: "Under 61", description: "Weight: 57kg to 61kg" },
        { id: "cb_u65", name: "Under 65", description: "Weight: 61kg to 65kg" },
        { id: "cb_o65", name: "Over 65", description: "Weight: 65kg+" },
    ],
    cadet_girls: [
        { id: "cg_u29", name: "Under 29", description: "Weight: Up to 29kg" },
        { id: "cg_u33", name: "Under 33", description: "Weight: 29kg to 33kg" },
        { id: "cg_u37", name: "Under 37", description: "Weight: 33kg to 37kg" },
        { id: "cg_u41", name: "Under 41", description: "Weight: 37kg to 41kg" },
        { id: "cg_u44", name: "Under 44", description: "Weight: 41kg to 44kg" },
        { id: "cg_u47", name: "Under 47", description: "Weight: 44kg to 47kg" },
        { id: "cg_u51", name: "Under 51", description: "Weight: 47kg to 51kg" },
        { id: "cg_u55", name: "Under 55", description: "Weight: 51kg to 55kg" },
        { id: "cg_u59", name: "Under 59", description: "Weight: 55kg to 59kg" },
        { id: "cg_o59", name: "Over 59", description: "Weight: 59kg+" },
    ],
    junior_boys: [
        { id: "jb_u45", name: "Under 45", description: "Weight: Up to 45kg" },
        { id: "jb_u48", name: "Under 48", description: "Weight: 45kg to 48kg" },
        { id: "jb_u51", name: "Under 51", description: "Weight: 48kg to 51kg" },
        { id: "jb_u55", name: "Under 55", description: "Weight: 51kg to 55kg" },
        { id: "jb_u59", name: "Under 59", description: "Weight: 55kg to 59kg" },
        { id: "jb_u63", name: "Under 63", description: "Weight: 59kg to 63kg" },
        { id: "jb_u68", name: "Under 68", description: "Weight: 63kg to 68kg" },
        { id: "jb_u73", name: "Under 73", description: "Weight: 68kg to 73kg" },
        { id: "jb_u78", name: "Under 78", description: "Weight: 73kg to 78kg" },
        { id: "jb_o78", name: "Over 78", description: "Weight: 78kg+" },
    ],
    junior_girls: [
        { id: "jg_u42", name: "Under 42", description: "Weight: Up to 42kg" },
        { id: "jg_u44", name: "Under 44", description: "Weight: 42kg to 44kg" },
        { id: "jg_u46", name: "Under 46", description: "Weight: 44kg to 46kg" },
        { id: "jg_u49", name: "Under 49", description: "Weight: 46kg to 49kg" },
        { id: "jg_u52", name: "Under 52", description: "Weight: 49kg to 52kg" },
        { id: "jg_u55", name: "Under 55", description: "Weight: 52kg to 55kg" },
        { id: "jg_u59", name: "Under 59", description: "Weight: 55kg to 59kg" },
        { id: "jg_u63", name: "Under 63", description: "Weight: 59kg to 63kg" },
        { id: "jg_u68", name: "Under 68", description: "Weight: 63kg to 68kg" },
        { id: "jg_o68", name: "Over 68", description: "Weight: 68kg+" },
    ],
    senior_boys: [
        { id: "sb_u54", name: "Under 54", description: "Weight: Up to 54kg" },
        { id: "sb_u58", name: "Under 58", description: "Weight: 54kg to 58kg" },
        { id: "sb_u63", name: "Under 63", description: "Weight: 58kg to 63kg" },
        { id: "sb_u68", name: "Under 68", description: "Weight: 63kg to 68kg" },
        { id: "sb_u74", name: "Under 74", description: "Weight: 68kg to 74kg" },
        { id: "sb_u80", name: "Under 80", description: "Weight: 74kg to 80kg" },
        { id: "sb_u87", name: "Under 87", description: "Weight: 80kg to 87kg" },
        { id: "sb_o87", name: "Over 87", description: "Weight: 87kg+" },
    ],
    senior_girls: [
        { id: "sg_u46", name: "Under 46", description: "Weight: Up to 46kg" },
        { id: "sg_u49", name: "Under 49", description: "Weight: 46kg to 49kg" },
        { id: "sg_u53", name: "Under 53", description: "Weight: 49kg to 53kg" },
        { id: "sg_u57", name: "Under 57", description: "Weight: 53kg to 57kg" },
        { id: "sg_u62", name: "Under 62", description: "Weight: 57kg to 62kg" },
        { id: "sg_u67", name: "Under 67", description: "Weight: 62kg to 67kg" },
        { id: "sg_u73", name: "Under 73", description: "Weight: 67kg to 73kg" },
        { id: "sg_o73", name: "Over 73", description: "Weight: 73kg+" },
    ],
};


export function getWeightCategoriesForAgeCategory(ageCategoryId: string) {
    if (!ageCategoryId) return [];
    return (WEIGHT_CATEGORIES as any)[ageCategoryId] || [];
}

export function getCategoryInfo(ageCategoryId: string, weightCategoryId: string) {
    const ageCategory = AGE_CATEGORIES.find(ac => ac.id === ageCategoryId);
    const weightCategoriesForAge = getWeightCategoriesForAgeCategory(ageCategoryId);
    const weightCategory = weightCategoriesForAge.find((wc: any) => wc.id === weightCategoryId);

    return {
        ageCategoryName: ageCategory?.name,
        ageCategoryDescription: ageCategory?.description,
        weightCategoryName: weightCategory?.name,
        weightCategoryDescription: weightCategory?.description,
    }
}
