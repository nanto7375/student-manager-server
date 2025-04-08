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
  protected _validateStudentName(name: string) {
    if (name.length < 1 || name.length > 30) throw new BadRequest('wrong name');
  }
  protected _validateBirthYear(birthYear: string) {
    if (birthYear.length !== 4) throw new BadRequest('wrong birthYear');
  }
  protected _validateBirthDate(birthDate: string) {
    if (birthDate.length !== 4) throw new BadRequest('wrong birthDate');
  }
  protected _validateGender(gender: Gender) {
    if (!Object.values(Gender).includes(gender)) throw new BadRequest('wrong gender');
  }
  protected _validatePhone(phone: string) {
    if (phone.length < 9 || phone.length > 13) throw new BadRequest('wrong phone');
  }
  protected _validateTuition(tuition: number) {
    if (tuition < 100_000) throw new BadRequest('wrong tuition');
  }
  protected _validateSchoolName(schoolName: string) {
    if (schoolName.length < 1 || schoolName.length > 30) throw new BadRequest('wrong schoolName');
  }
  protected _validateSchoolLevel(schoolLevel: SchoolLevel) {
    if (!Object.values(SchoolLevel).includes(schoolLevel)) throw new BadRequest('wrong schoolLevel');
  }
}

class StudentCreator extends StudentValidator {
  private _student: Student;

  constructor(name: string) {
    super();
    this._validateStudentName(name);
    this._student = new Student();
    this._student.name = name;
  }

  setBirth({ birthYear, birthDate, gender }: CreatorSetBirth) {
    this._validateBirthYear(birthYear);
    this._validateBirthDate(birthDate);
    this._validateGender(gender);

    this._student.birthYear = birthYear;
    this._student.birthDate = birthDate;
    this._student.gender = gender;
    return this;
  }
  setContacts({ phone, parentPhone }: CreatorSetPhone) {
    this._validatePhone(phone);
    this._validatePhone(parentPhone);

    this._student.phone = phone;
    this._student.parentPhone = parentPhone;
    return this;
  }
  setSchool({ schoolName, schoolLevel }: CreatorSetSchool) {
    this._validateSchoolName(schoolName);
    this._validateSchoolLevel(schoolLevel);

    this._student.schoolName = schoolName;
    this._student.schoolLevel = schoolLevel;
    return this;
  }
  setClass({ classSchedule, tuition, registeredAt }: CreatorSetClass) {
    this._validateTuition(tuition);

    this._student.classSchedule = classSchedule;
    this._student.tuition = tuition;
    this._student.registeredAt = registeredAt;
    return this;
  }
  create() {
    return this._student;
  }
}

class StudentEditor extends StudentValidator {
  constructor(private _student: Student) {
    super();
  }

  setContacts({ phone, parentPhone }: EditorSetPhone) {
    this._validatePhone(phone);
    this._validatePhone(parentPhone);

    if (phone) this._student.phone = phone;
    if (parentPhone) this._student.parentPhone = parentPhone;
    return this;
  }
  setSchool({ schoolName, schoolLevel }: EditorSetSchool) {
    this._validateSchoolName(schoolName);
    this._validateSchoolLevel(schoolLevel);

    if (schoolName) this._student.schoolName = schoolName;
    if (schoolLevel) this._student.schoolLevel = schoolLevel;
    return this;
  }
  setClass({ classSchedule, tuition }: EditorSetClass) {
    this._validateTuition(tuition);

    if (classSchedule) this._student.classSchedule = classSchedule;
    if (tuition) this._student.tuition = tuition;
    return this;
  }
  edit() {
    return this._student;
  }
}

@Injectable()
export class StudentBuilder {
  creator(name: string) {
    return new StudentCreator(name);
  }
  editor(student: Student) {
    return new StudentEditor(student);
  }
}
