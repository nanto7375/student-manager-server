import { Student } from './entity/student.entity';
import { SchoolLevel } from '@src/common/constant/common.const';
import { Schedule } from '@src/schedule/entity/schedule.entity';
import { isNullish, now } from '@src/common/utils/etc';
import { BadRequestException } from '@nestjs/common';

type SetBirthParams = {
  birthYear: string;
  birthDate: string;
};
type SetContactsParams = {
  phone: string;
  parentPhone: string;
};
type SetSchoolParams = {
  schoolName: string;
  schoolLevel: SchoolLevel;
  schoolGrade: number;
};

class StudentValidator {
  constructor(private readonly currentYear: number = now().getFullYear()) {}

  name(name: string) {
    if (name.length < 1 || name.length > 30) throw new BadRequestException('wrong name');
  }
  birthYear(birthYear: string) {
    if (birthYear.length !== 4 || !Number(birthYear)) throw new BadRequestException('wrong birthYear');
    if (Number(birthYear) > this.currentYear) throw new BadRequestException('wrong birthYear');
  }
  birthDate(birthDate: string) {
    if (birthDate.length !== 4 || !Number(birthDate)) throw new BadRequestException('wrong birthDate');

    const month = Number(birthDate.substring(0, 2));
    const day = Number(birthDate.substring(2, 4));
    if (month < 1 || month > 12) throw new BadRequestException('wrong birthDate');
    if (day < 1 || day > 31) throw new BadRequestException('wrong birthDate');
  }
  phone(phone: string) {
    if (phone.length > 13) throw new BadRequestException('wrong phone');
  }
  schoolName(schoolName: string) {
    if (schoolName.length < 1 || schoolName.length > 30) throw new BadRequestException('wrong schoolName');
  }
  schoolLevel(schoolLevel: SchoolLevel) {
    if (!Object.values(SchoolLevel).includes(schoolLevel)) throw new BadRequestException('wrong schoolLevel');
  }
  schoolGrade(schoolGrade: number) {
    if (schoolGrade < 1 || schoolGrade > 6) throw new BadRequestException('wrong schoolGrade');
  }
}

class StudentCreator {
  private _student: Student;
  private validate: StudentValidator;

  constructor(name: string, registeredAt: Date) {
    this.validate = new StudentValidator();
    this.validate.name(name);

    this._student = new Student();
    this._student.name = name;
    this._student.registeredAt = registeredAt;
  }

  setBirth({ birthYear, birthDate }: SetBirthParams) {
    this.validate.birthYear(birthYear);
    this.validate.birthDate(birthDate);

    this._student.birthYear = birthYear;
    this._student.birthDate = birthDate;
    return this;
  }
  setContacts({ phone, parentPhone }: SetContactsParams) {
    this.validate.phone(phone);
    this.validate.phone(parentPhone);

    this._student.phone = phone;
    this._student.parentPhone = parentPhone;
    return this;
  }
  setSchool({ schoolName, schoolLevel, schoolGrade }: SetSchoolParams) {
    this.validate.schoolName(schoolName);
    this.validate.schoolLevel(schoolLevel);
    this.validate.schoolGrade(schoolGrade);

    this._student.schoolName = schoolName;
    this._student.schoolLevel = schoolLevel;
    this._student.schoolGrade = schoolGrade;
    return this;
  }
  setSchedule(schedule: Schedule) {
    this._student.schedule = schedule;
    return this;
  }
  setNote(note: string) {
    if (note) this._student.note = note;
    return this;
  }
  create() {
    return this._student;
  }
}

class StudentEditor {
  private validate: StudentValidator;
  private _student: Student;

  constructor(student: Student) {
    this.validate = new StudentValidator();
    this._student = student;
  }

  setBirth({ birthYear, birthDate }: SetBirthParams) {
    this.validate.birthYear(birthYear);
    this.validate.birthDate(birthDate);

    this._student.birthYear = birthYear;
    this._student.birthDate = birthDate;
    return this;
  }
  setContacts({ phone, parentPhone }: SetContactsParams) {
    !isNullish(phone) && this.validate.phone(phone);
    !isNullish(parentPhone) && this.validate.phone(parentPhone);

    if (phone) this._student.phone = phone;
    if (parentPhone) this._student.parentPhone = parentPhone;
    return this;
  }
  setSchool({ schoolName, schoolLevel, schoolGrade }: SetSchoolParams) {
    !isNullish(schoolName) && this.validate.schoolName(schoolName);
    !isNullish(schoolLevel) && this.validate.schoolLevel(schoolLevel);
    !isNullish(schoolGrade) && this.validate.schoolGrade(schoolGrade);

    if (schoolName) this._student.schoolName = schoolName;
    if (schoolLevel) this._student.schoolLevel = schoolLevel;
    if (schoolGrade) this._student.schoolGrade = schoolGrade;
    return this;
  }
  edit() {
    return this._student;
  }
}

type CreatorParams = {
  name: string;
  registeredAt: Date;
};
export class StudentBuilder {
  creator({ name, registeredAt }: CreatorParams) {
    return new StudentCreator(name, registeredAt);
  }
  editor(student: Student) {
    return new StudentEditor(student);
  }
}
