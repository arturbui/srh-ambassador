import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Locale } from './types';

// UI chrome translation — separate from the `locale` param already sent to
// the CMS (which controls which language the actual News/Events/etc.
// content comes back in). This dictionary only covers text this app itself
// authored (labels, buttons, empty states).
const en = {
  appName: 'SRH Ambassador',
  navHome: 'Home',
  navNews: 'News',
  navEvents: 'Events',
  navClubs: 'Clubs',
  navActivities: 'Activities',
  navDocuments: 'Documents',
  navMembership: 'My Clubs',
  navLogin: 'Log in',
  language: 'Language',

  heroHeadline: 'Welcome to SRH Ambassador',
  heroSubtext: 'Discover clubs, events, and news from across the SRH community.',
  heroCtaClubs: 'Explore clubs',
  heroCtaEvents: "See what's on",

  authLogIn: 'Log in',
  authCreateAccount: 'Create an account',
  authUsername: 'Username',
  authEmail: 'Email',
  authPassword: 'Password',
  authRegister: 'Register',
  authNeedAccount: 'Need an account? Register',
  authHaveAccount: 'Have an account? Log in',
  authLogOut: 'Log out',

  // University status (admin-assigned — who someone is) vs. the secondary
  // tags below (what they currently do — derived from their permission role).
  statusStudent: 'Student',
  statusExchangeStudent: 'Exchange Student',
  statusProfessor: 'Professor',
  statusAmbassador: 'Ambassador',
  tagOwnsClub: 'Owns a club',
  tagWritesNews: 'Writes news',
  tagPostsEvents: 'Posts events',

  loginPageTitle: 'Log in',
  demoProfilesHeading: 'Try a demo account',
  demoProfilesSubtext: 'Click a profile to log in instantly and see what that role can do.',
  demoStudentLabel: 'Demo Student',
  demoStudentDesc: 'A baseline logged-in student — can join clubs.',
  demoLeaderLabel: 'Demo Club Leader',
  demoLeaderDesc: 'Leads Demo Robotics Club — can manage its activities, documents, and roster.',
  demoEditorLabel: 'Demo Content Editor',
  demoEditorDesc: 'Can write and publish news articles.',
  demoAmbassadorLabel: 'Demo Ambassador',
  demoAmbassadorDesc: 'Can post and manage campus events.',
  orManualLogin: 'Or log in manually',

  loading: 'Loading…',
  errorPrefix: 'Error:',

  clubsNoneVisible: 'No clubs visible yet.',
  clubsStatusPending: 'Pending approval',
  clubsStatusApproved: 'Approved',
  clubsStatusRejected: 'Rejected',
  clubsYouLead: 'You lead this club',
  clubsYouAreMember: "You're a member",
  clubsHostedBy: 'Hosted by {name}',
  clubsJoin: 'Join club',
  clubsLeave: 'Leave club',
  clubsEdit: 'Edit club',
  clubsSaveEdit: 'Save changes',
  clubsStart: 'Start a club',
  fieldName: 'Name',
  fieldDescription: 'Description',
  fieldHostName: 'Host name',
  fieldCategory: 'Category',
  fieldClub: 'Club',
  none: 'None',
  clubsPendingNotice:
    "New clubs start pending until a staff member approves them — you'll still see it here as its leader.",
  clubsCreate: 'Create club',

  activitiesNone: 'No activities yet.',
  activitiesSchedule: 'Schedule an activity',
  activitiesSelectLedClub: 'Select a club you lead',
  fieldTitle: 'Title',
  fieldDateTime: 'Date & time',
  fieldLocation: 'Location',
  fieldCapacity: 'Capacity',
  activitiesCreate: 'Create activity',
  activitiesLeadFirst: "Only a club's leader can schedule its activities — lead a club first.",
  activitiesCapacityLabel: 'Capacity: {n}',
  activitiesJoinToSee: 'Join a club to see its activities here.',
  activitiesLoginToSee: 'Log in to see activities for your clubs.',

  documentsNone: 'No documents visible to you yet.',
  visibilityPublic: 'Public',
  visibilityMembers: 'Members only',
  visibilityLeaders: 'Leaders only',
  documentsUpload: 'Upload a document',
  documentsWhoCanSee: 'Who can see this',
  visibilityPublicOption: 'Public — anyone',
  fieldFile: 'File',
  documentsChooseFile: 'Choose a file to upload.',
  upload: 'Upload',
  download: 'Download {name}',
  documentsLeadFirst: "Only a club's leader can upload its documents — lead a club first.",

  eventsNone: 'No published events yet.',
  eventsHost: 'Host an event',
  eventsCreate: 'Create event',
  eventsAmbassadorOnly: 'Only Ambassadors can post events — ask a club administrator to grant that role.',
  rename: 'Rename',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  untitledEvent: 'Untitled Event',
  materials: 'Materials',
  organizerProvided: 'organizer-provided',
  downloadPlain: 'Download',

  newsNone: 'No published articles yet.',
  newsWriteArticle: 'Write an article',
  categoryAnnouncement: 'Announcement',
  categoryReport: 'Report',
  fieldContent: 'Content',
  contentPlaceholder: 'One paragraph per line',
  publish: 'Publish',
  newsEditorOnly: 'Only Content Editors can write news articles — ask a club administrator to grant that role.',
  byAuthor: 'by {name}',

  membershipLoginPrompt: 'Log in to see your club memberships.',
  membershipNone: "You haven't joined any clubs yet — see the Clubs tab.",
  roleLeader: 'Leader',
  roleMember: 'Member',
  sinceDate: 'Since {date}',
  roster: 'Roster',
  promoteToLeader: 'Promote to leader',
  remove: 'Remove',
  noOtherMembers: 'No other members yet.',
};

type Dictionary = Record<keyof typeof en, string>;
export type TranslationKey = keyof Dictionary;

const deDE: Dictionary = {
  appName: 'SRH Ambassador',
  navHome: 'Startseite',
  navNews: 'Neuigkeiten',
  navEvents: 'Veranstaltungen',
  navClubs: 'Vereine',
  navActivities: 'Aktivitäten',
  navDocuments: 'Dokumente',
  navMembership: 'Meine Vereine',
  navLogin: 'Anmelden',
  language: 'Sprache',

  heroHeadline: 'Willkommen bei SRH Ambassador',
  heroSubtext: 'Entdecke Vereine, Veranstaltungen und Neuigkeiten der SRH-Community.',
  heroCtaClubs: 'Vereine entdecken',
  heroCtaEvents: 'Veranstaltungen ansehen',

  authLogIn: 'Anmelden',
  authCreateAccount: 'Konto erstellen',
  authUsername: 'Benutzername',
  authEmail: 'E-Mail',
  authPassword: 'Passwort',
  authRegister: 'Registrieren',
  authNeedAccount: 'Noch kein Konto? Registrieren',
  authHaveAccount: 'Bereits ein Konto? Anmelden',
  authLogOut: 'Abmelden',

  statusStudent: 'Student:in',
  statusExchangeStudent: 'Austauschstudent:in',
  statusProfessor: 'Professor:in',
  statusAmbassador: 'Ambassador',
  tagOwnsClub: 'Leitet einen Verein',
  tagWritesNews: 'Schreibt Neuigkeiten',
  tagPostsEvents: 'Erstellt Veranstaltungen',

  loginPageTitle: 'Anmelden',
  demoProfilesHeading: 'Demo-Konto ausprobieren',
  demoProfilesSubtext: 'Klicke auf ein Profil, um dich sofort anzumelden und zu sehen, was diese Rolle kann.',
  demoStudentLabel: 'Demo-Student:in',
  demoStudentDesc: 'Ein einfach angemeldeter Studierender — kann Vereinen beitreten.',
  demoLeaderLabel: 'Demo-Vereinsleitung',
  demoLeaderDesc: 'Leitet den Demo Robotics Club — kann dessen Aktivitäten, Dokumente und Mitglieder verwalten.',
  demoEditorLabel: 'Demo-Redakteur:in',
  demoEditorDesc: 'Kann Neuigkeiten verfassen und veröffentlichen.',
  demoAmbassadorLabel: 'Demo-Ambassador',
  demoAmbassadorDesc: 'Kann Campus-Veranstaltungen erstellen und verwalten.',
  orManualLogin: 'Oder manuell anmelden',

  loading: 'Wird geladen…',
  errorPrefix: 'Fehler:',

  clubsNoneVisible: 'Noch keine Vereine sichtbar.',
  clubsStatusPending: 'Genehmigung ausstehend',
  clubsStatusApproved: 'Genehmigt',
  clubsStatusRejected: 'Abgelehnt',
  clubsYouLead: 'Du leitest diesen Verein',
  clubsYouAreMember: 'Du bist Mitglied',
  clubsHostedBy: 'Veranstaltet von {name}',
  clubsJoin: 'Verein beitreten',
  clubsLeave: 'Verein verlassen',
  clubsEdit: 'Verein bearbeiten',
  clubsSaveEdit: 'Änderungen speichern',
  clubsStart: 'Verein gründen',
  fieldName: 'Name',
  fieldDescription: 'Beschreibung',
  fieldHostName: 'Name des Gastgebers',
  fieldCategory: 'Kategorie',
  fieldClub: 'Verein',
  none: 'Keine',
  clubsPendingNotice:
    'Neue Vereine sind zunächst ausstehend, bis ein Teammitglied sie genehmigt — als Leitung siehst du deinen Verein hier trotzdem.',
  clubsCreate: 'Verein erstellen',

  activitiesNone: 'Noch keine Aktivitäten.',
  activitiesSchedule: 'Aktivität planen',
  activitiesSelectLedClub: 'Wähle einen Verein, den du leitest',
  fieldTitle: 'Titel',
  fieldDateTime: 'Datum & Uhrzeit',
  fieldLocation: 'Ort',
  fieldCapacity: 'Kapazität',
  activitiesCreate: 'Aktivität erstellen',
  activitiesLeadFirst: 'Nur die Leitung eines Vereins kann dessen Aktivitäten planen — leite zuerst einen Verein.',
  activitiesCapacityLabel: 'Kapazität: {n}',
  activitiesJoinToSee: 'Tritt einem Verein bei, um dessen Aktivitäten hier zu sehen.',
  activitiesLoginToSee: 'Melde dich an, um die Aktivitäten deiner Vereine zu sehen.',

  documentsNone: 'Noch keine Dokumente für dich sichtbar.',
  visibilityPublic: 'Öffentlich',
  visibilityMembers: 'Nur Mitglieder',
  visibilityLeaders: 'Nur Vereinsleitung',
  documentsUpload: 'Dokument hochladen',
  documentsWhoCanSee: 'Wer kann dies sehen',
  visibilityPublicOption: 'Öffentlich — für alle',
  fieldFile: 'Datei',
  documentsChooseFile: 'Wähle eine Datei zum Hochladen aus.',
  upload: 'Hochladen',
  download: '{name} herunterladen',
  documentsLeadFirst: 'Nur die Leitung eines Vereins kann dessen Dokumente hochladen — leite zuerst einen Verein.',

  eventsNone: 'Noch keine veröffentlichten Veranstaltungen.',
  eventsHost: 'Veranstaltung erstellen',
  eventsCreate: 'Veranstaltung erstellen',
  eventsAmbassadorOnly: 'Nur Ambassadors können Veranstaltungen erstellen — bitte eine Vereinsverwaltung um diese Rolle.',
  rename: 'Umbenennen',
  save: 'Speichern',
  cancel: 'Abbrechen',
  delete: 'Löschen',
  untitledEvent: 'Unbenannte Veranstaltung',
  materials: 'Materialien',
  organizerProvided: 'vom Veranstalter bereitgestellt',
  downloadPlain: 'Herunterladen',

  newsNone: 'Noch keine veröffentlichten Artikel.',
  newsWriteArticle: 'Artikel verfassen',
  categoryAnnouncement: 'Ankündigung',
  categoryReport: 'Bericht',
  fieldContent: 'Inhalt',
  contentPlaceholder: 'Ein Absatz pro Zeile',
  publish: 'Veröffentlichen',
  newsEditorOnly: 'Nur Redakteur:innen können Artikel verfassen — bitte eine Vereinsverwaltung um diese Rolle.',
  byAuthor: 'von {name}',

  membershipLoginPrompt: 'Melde dich an, um deine Vereinsmitgliedschaften zu sehen.',
  membershipNone: 'Du bist noch keinem Verein beigetreten — siehe den Reiter Vereine.',
  roleLeader: 'Leitung',
  roleMember: 'Mitglied',
  sinceDate: 'Seit {date}',
  roster: 'Mitgliederliste',
  promoteToLeader: 'Zur Leitung befördern',
  remove: 'Entfernen',
  noOtherMembers: 'Noch keine weiteren Mitglieder.',
};

const dictionaries: Record<Locale, Dictionary> = { en, 'de-DE': deDE };

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleState | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  function t(key: TranslationKey, vars?: Record<string, string | number>) {
    let text = dictionaries[locale][key] ?? en[key];
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.replace(`{${name}}`, String(value));
      }
    }
    return text;
  }

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}
