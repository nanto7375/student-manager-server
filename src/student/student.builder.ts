import { SchoolLevel } from '@src/common/constant/common.const';
import { isNullish } from '@src/common/utils/etc';
import { BadRequestException } from '@nestjs/common';
import { Prisma, Student } from '@src/generated/prisma/client';

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
  constructor(private readonly currentYear: number) {}

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
  private _student: Prisma.StudentCreateInput;
  private validate: StudentValidator;

  constructor(name: string, registeredAt: Date) {
    this.validate = new StudentValidator(registeredAt.getFullYear());
    this.validate.name(name);

    this._student = { name, registeredAt };
  }

  setBirth({ birthYear, birthDate }: SetBirthParams) {
    if (!isNullish(birthYear)) {
      this.validate.birthYear(birthYear);
      this._student.birthYear = birthYear;
    }
    if (!isNullish(birthDate)) {
      this.validate.birthDate(birthDate);
      this._student.birthDate = birthDate;
    }
    return this;
  }
  setContacts({ phone, parentPhone }: SetContactsParams) {
    if (!isNullish(phone)) {
      this.validate.phone(phone);
      this._student.phone = phone;
    }
    if (!isNullish(parentPhone)) {
      this.validate.phone(parentPhone);
      this._student.parentPhone = parentPhone;
    }
    return this;
  }
  setSchool({ schoolName, schoolLevel, schoolGrade }: SetSchoolParams) {
    if (!isNullish(schoolName)) {
      this.validate.schoolName(schoolName);
      this._student.schoolName = schoolName;
    }
    if (!isNullish(schoolLevel)) {
      this.validate.schoolLevel(schoolLevel);
      this._student.schoolLevel = schoolLevel;
    }
    if (!isNullish(schoolGrade)) {
      this.validate.schoolGrade(schoolGrade);
      this._student.schoolGrade = schoolGrade;
    }
    return this;
  }
  setSchedule(scheduleId: number) {
    if (!isNullish(scheduleId)) {
      this._student.schedule = { connect: { id: scheduleId } };
    }
    return this;
  }
  setNote(note: string) {
    if (!isNullish(note)) {
      this._student.note = note;
    }
    return this;
  }
  create() {
    return this._student;
  }
}

class StudentEditor {
  private validate: StudentValidator;

  constructor(private _student: Student) {
    this.validate = new StudentValidator(this._student.registeredAt.getFullYear());
  }

  setBirth({ birthYear, birthDate }: SetBirthParams) {
    if (!isNullish(birthYear)) {
      this.validate.birthYear(birthYear);
      this._student.birthYear = birthYear;
    }
    if (!isNullish(birthDate)) {
      this.validate.birthDate(birthDate);
      this._student.birthDate = birthDate;
    }
    return this;
  }
  setContacts({ phone, parentPhone }: SetContactsParams) {
    if (!isNullish(phone)) {
      this.validate.phone(phone);
      this._student.phone = phone;
    }
    if (!isNullish(parentPhone)) {
      this.validate.phone(parentPhone);
      this._student.parentPhone = parentPhone;
    }
    return this;
  }
  setSchool({ schoolName, schoolLevel, schoolGrade }: SetSchoolParams) {
    if (!isNullish(schoolName)) {
      this.validate.schoolName(schoolName);
      this._student.schoolName = schoolName;
    }
    if (!isNullish(schoolLevel)) {
      this.validate.schoolLevel(schoolLevel);
      this._student.schoolLevel = schoolLevel;
    }
    if (!isNullish(schoolGrade)) {
      this.validate.schoolGrade(schoolGrade);
      this._student.schoolGrade = schoolGrade;
    }
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
