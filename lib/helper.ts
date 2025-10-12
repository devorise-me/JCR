export function translateTime(time: string) {
    switch (time) {
      case "Morning":
        return "صباحي";
      case "Evening":
        return "مسائي";
      case "Local":
        return "محلي";
      case "General":
        return "عام";
      case "International":
        return "دولي";
      case "GeneralSymbolRound":
        return "شوط رمز عام";
      case "InternationalCodeRound":
        return "شوط رمز دولي";
      case "SymbolRun":
        return "شوط رمز";
      default:
        return "";
    }
}

export function translateAge(age: string) {
  switch (age) {
    case "GradeOne": return "مفرد";
    case "GradeTwo": return "حقايق";
    case "GradeThree": return "لقايا";
    case "GradeFour": return "جذاع";
    case "GradeFive": return "ثنايا";
    case "GradeSixMale": return "زمول";
    case "GradeSixFemale": return "حيل";
    default: return age;
  }
} 

export function translateSex(sex: string) {
  switch (sex) {
    case "Male": return "قعدان";
    case "Female": return "بكار";
    default: return sex;
  }
} 