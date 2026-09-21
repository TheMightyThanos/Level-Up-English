export interface RawQuestion {
  id: number;
  text: string;
  options: string[];
  key: number | string;
  correct_answer?: string;
  answer?: string;
  skill?: string;
  sub_skill?: string;
  cognitive_level?: string;
  longman_skill?: string;
  explanation?: string;
}

export interface RawPassage {
  title: string;
  text: string;
  questions: RawQuestion[];
}
