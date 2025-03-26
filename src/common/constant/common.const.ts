export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
}
export type GenderKeyType = keyof typeof Gender;

export enum SchoolLevel {
  ELEMENTARY = '초',
  MIDDLE = '중',
  HIGH = '고',
}
export type SchoolLevelKeyType = keyof typeof SchoolLevel;
