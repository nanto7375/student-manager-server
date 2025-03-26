import { Injectable } from '@nestjs/common';
import { Student } from './entity/student.entity';

class StudentCreator {
  private _student: Student;

  constructor(name: string) {
    this._student = new Student();
    this._student.name = name;
  }

  setBirth({ birthYear, birthDate, gender }) {
    this._student.birthYear = birthYear;
    this._student.birthDate = birthDate;
    this._student.gender = gender;
    return this;
  }
  setPhone({ phone, parentPhone }) {
    this._student.phone = phone;
    this._student.parentPhone = parentPhone;
    return this;
  }
  setSchool({ schoolName }) {
    this._student.schoolName = schoolName;
    return this;
  }
  setClass({ classSchedule, tuition }) {
    this._student.classSchedule = classSchedule;
    this._student.tuition = tuition;
    return this;
  }
  build() {
    return this._student;
  }
}

class StudentEditor {
  constructor(private readonly _student: Student) {}

  setPhone({ phone, parentPhone }) {
    if (phone) this._student.phone = phone;
    if (parentPhone) this._student.parentPhone = parentPhone;
    return this;
  }
  setSchool({ schoolName }) {
    if (schoolName) this._student.schoolName = schoolName;
    return this;
  }
  setClass({ classSchedule, tuition }) {
    if (classSchedule) this._student.classSchedule = classSchedule;
    if (tuition) this._student.tuition = tuition;
    return this;
  }
  edit() {
    return this;
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
