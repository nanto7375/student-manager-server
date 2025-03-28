import { ApiProperty } from '@nestjs/swagger';
import { Gender, SchoolLevelKey } from '@src/common/constant/common.const';

export class RegisterStudentRequestDto {
  @ApiProperty({ description: '이름' })
  name: string;

  @ApiProperty({ description: '생년' })
  birthYear: string;

  @ApiProperty({ description: '생년월일', nullable: true })
  birthDate: string;

  @ApiProperty({ description: '성별', nullable: true })
  gender: Gender;

  @ApiProperty({ description: '수업료', nullable: true })
  tuition: number;

  @ApiProperty({ description: '전화번호', nullable: true })
  phone: string;

  @ApiProperty({ description: '부모 전화번호', nullable: true })
  parentPhone: string;

  @ApiProperty({ description: '학교명', nullable: true })
  schoolName: string;

  @ApiProperty({ description: '학교 레벨', nullable: true })
  schoolLevel: SchoolLevelKey;

  @ApiProperty({ description: '수업 시간', nullable: true })
  classScheduleId: number;

  @ApiProperty({ description: '등록일', nullable: true })
  registeredAt: Date;
}
