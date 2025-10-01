
import { faker } from '@faker-js/faker';
import { Competition, Participant } from './types';
import { AGE_CATEGORIES, getWeightCategoriesForAgeCategory } from './categories';

export function generateSampleCompetition(): Omit<Competition, 'id' | 'created_at' | 'updated_at'> {
  const ageCategory = faker.helpers.arrayElement(AGE_CATEGORIES);
  const weightCategories = getWeightCategoriesForAgeCategory(ageCategory.id);
  const weightCategory = faker.helpers.arrayElement(weightCategories);
  const startDate = faker.date.future();
  const endDate = new Date(startDate.getTime() + faker.number.int({ min: 1, max: 3 }) * 24 * 60 * 60 * 1000);

  return {
    competition_name: `${faker.location.city()} Open ${faker.animal.type()} Championship`,
    address: `${faker.location.streetAddress()}, ${faker.location.city()}`,
    organized_by: `${faker.company.name()} Taekwondo Association`,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    age_category: ageCategory.id,
    weight_category: weightCategory.id,
    status: faker.helpers.arrayElement(['draft', 'published', 'completed']),
  };
}

export function generateSampleParticipant(): Omit<Participant, 'id' | 'competition_id' | 'created_at' | 'updated_at'> {
    return {
        name: faker.person.fullName(),
        dob: faker.date.past({ years: 20, refDate: new Date() }).toISOString(),
        weight: faker.number.int({ min: 40, max: 120 }),
        district: faker.location.city(),
        coach_name: faker.person.firstName(),
    };
}
