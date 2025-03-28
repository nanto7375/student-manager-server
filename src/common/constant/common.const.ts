export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
}
export type GenderKey = keyof typeof Gender;

export enum SchoolLevel {
  ELEMENTARY = '초',
  MIDDLE = '중',
  HIGH = '고',
}
export type SchoolLevelKey = keyof typeof SchoolLevel;
