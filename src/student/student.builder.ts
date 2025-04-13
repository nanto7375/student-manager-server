import { Injectable } from '@nestjs/common';
import { Student } from './entity/student.entity';
import { Gender, SchoolLevel } from '@src/common/constant/common.const';
import { ClassSchedule } from '@src/schedule/entity/class-schedule.entity';
import { BadRequest } from '@src/common/exception/definition.exception';

type CreatorSetBirth = {
  birthYear: string;
  birthDate: string;
  gender: Gender;
};
type CreatorSetPhone = {
  phone: string;
  parentPhone: string;
};
type CreatorSetSchool = {
  schoolName: string;
  schoolLevel: SchoolLevel;
};
type CreatorSetClass = {
  classSchedule: ClassSchedule;
  tuition: number;
  registeredAt: Date;
};

type EditorSetPhone = {
  phone: string;
  parentPhone: string;
};
type EditorSetSchool = {
  schoolName: string;
  schoolLevel: SchoolLevel;
};
type EditorSetClass = {
  classSchedule: ClassSchedule;
  tuition: number;
};

class StudentValidator {
  constructor(private readonly currentYear: number = new Date().getFullYear()) {}

  validateStudentName(name: string) {
    if (name.length < 1 || name.length > 30) throw new BadRequest('wrong name');
  }
  validateBirthYear(birthYear: string) {
    if (birthYear.length !== 4 || !Number(birthYear)) throw new BadRequest('wrong birthYear');
    if (Number(birthYear) < this.currentYear) throw new BadRequest('wrong birthYear');
  }
  validateBirthDate(birthDate: string) {
    if (birthDate.length !== 4 || !Number(birthDate)) throw new BadRequest('wrong birthDate');

    const month = Number(birthDate.substring(0, 2));
    const day = Number(birthDate.substring(2, 4));
    if (month < 1 || month > 12) throw new BadRequest('wrong birthDate');
    if (day < 1 || day > 31) throw new BadRequest('wrong birthDate');
  }
  validateGender(gender: Gender) {
    if (!Object.values(Gender).includes(gender)) throw new BadRequest('wrong gender');
  }
  validatePhone(phone: string) {
    if (phone.length < 9 || phone.length > 13) throw new BadRequest('wrong phone');
  }
  validateTuition(tuition: number) {
    if (tuition < 100_000) throw new BadRequest('wrong tuition');
  }
  validateSchoolName(schoolName: string) {
    if (schoolName.length < 1 || schoolName.length > 30) throw new BadRequest('wrong schoolName');
  }
  validateSchoolLevel(schoolLevel: SchoolLevel) {
    if (!Object.values(SchoolLevel).includes(schoolLevel)) throw new BadRequest('wrong schoolLevel');
  }
}

class StudentCreator {
  private validator: StudentValidator;
  private _student: Student;

  constructor(name: string) {
    this.validator = new StudentValidator();
    this.validator.validateStudentName(name);
    this._student = new Student();
    this._student.name = name;
  }

  setBirth({ birthYear, birthDate, gender }: CreatorSetBirth) {
    this.validator.validateBirthYear(birthYear);
    this.validator.validateBirthDate(birthDate);
    this.validator.validateGender(gender);

    this._student.birthYear = birthYear;
    this._student.birthDate = birthDate;
    this._student.gender = gender;
    return this;
  }
  setContacts({ phone, parentPhone }: CreatorSetPhone) {
    this.validator.validatePhone(phone);
    this.validator.validatePhone(parentPhone);

    this._student.phone = phone;
    this._student.parentPhone = parentPhone;
    return this;
  }
  setSchool({ schoolName, schoolLevel }: CreatorSetSchool) {
    this.validator.validateSchoolName(schoolName);
    this.validator.validateSchoolLevel(schoolLevel);

    this._student.schoolName = schoolName;
    this._student.schoolLevel = schoolLevel;
    return this;
  }
  setClass({ classSchedule, tuition, registeredAt }: CreatorSetClass) {
    this.validator.validateTuition(tuition);

    this._student.classSchedule = classSchedule;
    this._student.tuition = tuition;
    this._student.registeredAt = registeredAt;
    return this;
  }
  create() {
    return this._student;
  }
}

class StudentEditor {
  private validator: StudentValidator;
  private _student: Student;

  constructor(student: Student) {
    this.validator = new StudentValidator();
    this._student = student;
  }

  setContacts({ phone, parentPhone }: EditorSetPhone) {
    phone && this.validator.validatePhone(phone);
    parentPhone && this.validator.validatePhone(parentPhone);

    if (phone) this._student.phone = phone;
    if (parentPhone) this._student.parentPhone = parentPhone;
    return this;
  }
  setSchool({ schoolName, schoolLevel }: EditorSetSchool) {
    schoolName && this.validator.validateSchoolName(schoolName);
    schoolLevel && this.validator.validateSchoolLevel(schoolLevel);

    if (schoolName) this._student.schoolName = schoolName;
    if (schoolLevel) this._student.schoolLevel = schoolLevel;
    return this;
  }
  setClass({ classSchedule, tuition }: EditorSetClass) {
    tuition && this.validator.validateTuition(tuition);

    if (classSchedule) this._student.classSchedule = classSchedule;
    if (tuition) this._student.tuition = tuition;
    return this;
  }
  edit() {
    return this._student;
  }
}

export class StudentBuilder {
  creator(name: string) {
    return new StudentCreator(name);
  }
  editor(student: Student) {
    return new StudentEditor(student);
  }
}
