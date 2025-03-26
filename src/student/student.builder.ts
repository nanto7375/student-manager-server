import { Injectable } from '@nestjs/common';
import { Student } from './entity/student.entity';
import { Gender, GenderKeyType, SchoolLevel, SchoolLevelKeyType } from '@src/common/constant/common.const';
import { ClassSchedule } from '@src/schedule/entity/class-schedule.entity';

type CreatorSetBirth = {
  birthYear: string;
  birthDate: string;
  gender: GenderKeyType;
};
type CreatorSetPhone = {
  phone: string;
  parentPhone: string;
};
type CreatorSetSchool = {
  schoolName: string;
  schoolLevel: SchoolLevelKeyType;
};
type CreatorSetClass = {
  classSchedule: ClassSchedule;
  tuition: number;
};

type EditorSetPhone = {
  phone: string;
  parentPhone: string;
};
type EditorSetSchool = {
  schoolName: string;
  schoolLevel: SchoolLevelKeyType;
};
type EditorSetClass = {
  classSchedule: ClassSchedule;
  tuition: number;
};

class StudentCreator {
  private _student: Student;

  constructor(name: string) {
    this._student = new Student();
    this._student.name = name;
  }

  setBirth({ birthYear, birthDate, gender }: CreatorSetBirth) {
    this._student.birthYear = birthYear;
    this._student.birthDate = birthDate;
    this._student.gender = Gender[gender];
    return this;
  }
  setPhone({ phone, parentPhone }: CreatorSetPhone) {
    this._student.phone = phone;
    this._student.parentPhone = parentPhone;
    return this;
  }
  setSchool({ schoolName, schoolLevel }: CreatorSetSchool) {
    this._student.schoolName = schoolName;
    this._student.schoolLevel = SchoolLevel[schoolLevel];
    return this;
  }
  setClass({ classSchedule, tuition }: CreatorSetClass) {
    this._student.classSchedule = classSchedule;
    this._student.tuition = tuition;
    return this;
  }
  create() {
    return this._student;
  }
}

class StudentEditor {
  constructor(private readonly _student: Student) {}

  setPhone({ phone, parentPhone }: EditorSetPhone) {
    if (phone) this._student.phone = phone;
    if (parentPhone) this._student.parentPhone = parentPhone;
    return this;
  }
  setSchool({ schoolName, schoolLevel }: EditorSetSchool) {
    if (schoolName) this._student.schoolName = schoolName;
    if (schoolLevel) this._student.schoolLevel = SchoolLevel[schoolLevel];
    return this;
  }
  setClass({ classSchedule, tuition }: EditorSetClass) {
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
