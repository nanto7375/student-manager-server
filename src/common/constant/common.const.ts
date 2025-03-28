export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum SchoolLevel {
  ELEMENTARY = '초등학교',
  MIDDLE = '중학교',
  HIGH = '고등학교',
}
export type SchoolLevelKey = keyof typeof SchoolLevel;
