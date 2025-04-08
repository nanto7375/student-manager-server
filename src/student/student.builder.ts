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

class StudentCreator {
  private _student: Student;

  constructor(name: string) {
    if (name.length < 1 || name.length > 30) throw new BadRequest('wrong name');

    this._student = new Student();
    this._student.name = name;
  }

  setBirth({ birthYear, birthDate, gender }: CreatorSetBirth) {
    if (birthYear.length !== 4) throw new BadRequest('wrong birthYear');
    if (birthDate.length !== 4) throw new BadRequest('wrong birthDate');
    if (!Object.values(Gender).includes(gender)) throw new BadRequest('wrong gender');

    this._student.birthYear = birthYear;
    this._student.birthDate = birthDate;
    this._student.gender = gender;
    return this;
  }
  setContacts({ phone, parentPhone }: CreatorSetPhone) {
    if (phone.length < 9 || phone.length > 13) throw new BadRequest('wrong phone');
    if (parentPhone.length < 9 || parentPhone.length > 13) throw new BadRequest('wrong parentPhone');

    this._student.phone = phone;
    this._student.parentPhone = parentPhone;
    return this;
  }
  setSchool({ schoolName, schoolLevel }: CreatorSetSchool) {
    if (schoolName.length < 1 || schoolName.length > 30) throw new BadRequest('wrong schoolName');
    if (!Object.values(SchoolLevel).includes(schoolLevel)) throw new BadRequest('wrong schoolLevel');

    this._student.schoolName = schoolName;
    this._student.schoolLevel = schoolLevel;
    return this;
  }
  setClass({ classSchedule, tuition, registeredAt }: CreatorSetClass) {
    if (tuition < 100_000) throw new BadRequest('wrong tuition');

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
  constructor(private readonly _student: Student) {}

  setContacts({ phone, parentPhone }: EditorSetPhone) {
    if (phone && (phone.length < 9 || phone.length > 13)) throw new BadRequest('wrong phone');
    if (parentPhone && (parentPhone.length < 9 || parentPhone.length > 13)) throw new BadRequest('wrong parentPhone');

    if (phone) this._student.phone = phone;
    if (parentPhone) this._student.parentPhone = parentPhone;
    return this;
  }
  setSchool({ schoolName, schoolLevel }: EditorSetSchool) {
    if (schoolName && (schoolName.length < 1 || schoolName.length > 30)) throw new BadRequest('wrong schoolName');
    if (schoolLevel && !Object.values(SchoolLevel).includes(schoolLevel)) throw new BadRequest('wrong schoolLevel');

    if (schoolName) this._student.schoolName = schoolName;
    if (schoolLevel) this._student.schoolLevel = schoolLevel;
    return this;
  }
  setClass({ classSchedule, tuition }: EditorSetClass) {
    if (tuition && tuition < 100_000) throw new BadRequest('wrong tuition');

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
