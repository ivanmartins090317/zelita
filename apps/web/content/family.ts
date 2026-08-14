export interface FamilyNavItemContent {
  id: string;
  emoji: string;
  label: string;
  path: string;
}

export interface FamilyNavSectionContent {
  label?: string;
  items: FamilyNavItemContent[];
}

export interface FamilyAreaCopy {
  title: string;
  subtitle: string;
}

export interface FamilyPlaceholderContent {
  icon: string;
  title: string;
  description: string;
}

export interface FamilyPlanoContent {
  supportMailto: string;
  errors: {
    loadTitle: string;
    loadFailed: string;
    accessDenied: string;
    incomplete: string;
  };
  currentCard: {
    title: string;
    tags: {
      active: string;
      trial: string;
      paused: string;
      canceled: string;
    };
    trial: {
      badgeTemplate: string;
      bodyPrefix: string;
      bodyBold: string;
      bodySuffix: string;
    };
    billing: {
      trialChargeTemplate: string;
      trialChargeEmphasis: string;
      postTrialActive: string;
      pausedBody: string;
      canceledBody: string;
      unknownPlan: string;
    };
    elderNote: string;
    actions: {
      changePlan: string;
      changeCard: string;
      invoices: string;
      reactivate: string;
    };
  };
  usageCard: {
    title: string;
    whatsapp: {
      label: string;
      unlimitedSuffix: string;
    };
    voice: {
      label: string;
      monthTemplate: string;
      hint: string;
    };
    storage: {
      label: string;
      overQuotaHint: string;
      overQuotaTag: string;
    };
    members: {
      label: string;
      unlimitedSuffix: string;
      limitedTemplate: string;
    };
  };
  modals: {
    closeLabel: string;
    changePlan: {
      title: string;
      essentialTitle: string;
      essentialBody: string;
      cuidadoPlusTitle: string;
      cuidadoPlusBody: string;
      familiaNote: string;
      ctaLabel: string;
    };
    changeCard: {
      title: string;
      body: string;
    };
    invoices: {
      title: string;
      emptyTitle: string;
      body: string;
    };
  };
}

export interface FamilyAjustesContent {
  signOutDescription: string;
  readOnlyNote: string;
  pausedHint: string;
  errors: {
    loadTitle: string;
    loadFailed: string;
    accessDenied: string;
    incomplete: string;
    forbidden: string;
    accountPaused: string;
    invalidPayload: string;
    saveFailed: string;
  };
  channels: {
    cardTitle: string;
    cardIcon: string;
    whatsappTitle: string;
    whatsappSubtitle: string;
    voiceTitle: string;
    voiceSubtitle: string;
    shortcutTitle: string;
    shortcutSubtitle: string;
    videoTitle: string;
    howItWorks: string;
    saveButton: string;
    saveSuccess: string;
    optInPendingNote: string;
    tags: {
      active: string;
      pending: string;
      inactive: string;
      notLinked: string;
      unavailable: string;
    };
    options: Array<{
      slug: string;
      title: string;
      description: string;
    }>;
  };
  tone: {
    cardTitle: string;
    cardIcon: string;
    toneLabel: string;
    dndBeforeLabel: string;
    dndAfterLabel: string;
    previewTitleTemplate: string;
    previewEmptyHint: string;
    toneNote: string;
    saveButton: string;
    saveSuccess: string;
    tones: Array<{ slug: string; label: string }>;
  };
  privacy: {
    cardTitle: string;
    cardIcon: string;
    messagesTitle: string;
    messagesSubtitleActive: string;
    messagesSubtitlePending: string;
    geoTitle: string;
    geoSubtitleActive: string;
    geoSubtitlePending: string;
    geoSubtitleRevoked: string;
    healthTitle: string;
    healthSubtitle: string;
    lgpdTitle: string;
    lgpdSubtitle: string;
    lgpdButton: string;
    loginTitle: string;
    loginSubtitle: string;
    devicesTitle: string;
    devicesSubtitle: string;
    devicesManageButton: string;
    accessLogTitle: string;
    accessLogButton: string;
    tags: {
      current: string;
      pending: string;
      revoked: string;
      active: string;
    };
  };
  recipient: {
    cardTitleTemplate: string;
    editButton: string;
    saveSuccess: string;
    fields: {
      fullName: string;
      displayName: string;
      birthDate: string;
      whatsapp: string;
      address: string;
    };
    modal: {
      title: string;
      fullNameLabel: string;
      displayNameLabel: string;
      birthDateLabel: string;
      whatsappLabel: string;
      addressLabel: string;
      saveButton: string;
      cancelButton: string;
      validationSummary: string;
    };
  };
  lgpdModal: {
    title: string;
    typeLabel: string;
    exportOption: string;
    deleteOption: string;
    deadlineNote: string;
    confirmLabel: string;
    submitButton: string;
    cancelButton: string;
    successMessage: string;
  };
  accessLogModal: {
    title: string;
    body: string;
    closeButton: string;
  };
  signOut: {
    button: string;
  };
}

export interface FamilyAvisosContent {
  pausedHint: string;
  feed: {
    cardTitle: string;
    filtersAriaLabel: string;
    filters: Record<"all" | "emergency" | "medications" | "location", string>;
    status: { open: string; resolved: string };
    emptyIcon: string;
    emptyTitle: string;
    emptyDescription: string;
    filterEmptyTitle: string;
    filterEmpty: Partial<
      Record<"all" | "emergency" | "medications" | "location", string>
    >;
    loadMore: string;
    packRefillTitle: string;
    packRefillSubtitle: string;
    packLastDayTitle: string;
    reminderUnreadTitle: string;
    reminderUnreadSubtitle: string;
    sosTitle: string;
    sosSubtitleOpen: string;
    sosSubtitleResolved: string;
    zoneExitTitle: string;
    zoneExitSubtitleOpen: string;
    zoneExitSubtitleResolved: string;
    inviteTitle: string;
    inviteSubtitle: string;
    examTitle: string;
    examSubtitle: string;
    removedSource: string;
    linkView: string;
  };
  matrix: {
    cardTitle: string;
    editButton: string;
    editCell: string;
    eventTypeHeader: string;
    rowLabels: Record<
      "sos" | "pack_refill" | "zone_exit" | "reminder_unread",
      string
    >;
    channelLabels: Record<
      "panel" | "email" | "whatsapp" | "call",
      string
    >;
    emergencyPhoneNote: string;
    readOnlyNote: string;
    footerHint: string;
    settingsLink: string;
    saveSuccess: string;
    modal: {
      title: string;
      hint: string;
      cancel: string;
      save: string;
      saving: string;
    };
  };
  hoje: {
    noticesNoneHint: string;
    noticesNoneUrgentHint: string;
    noticesUrgentHint: string;
    noticesAttentionHint: string;
    activityInvite: string;
    activityExam: string;
  };
  errors: {
    loadTitle: string;
    loadFailed: string;
    forbidden: string;
    incomplete: string;
    invalidPayload: string;
    memberNotFound: string;
    invalidChannels: string;
    sosEmergencyRequired: string;
    saveFailed: string;
    accountPaused: string;
  };
}

export interface FamilyContent {
  brand: {
    name: string;
  };
  recipientPicker: {
    switchLabel: string;
    ageUnknown: string;
    modalTitle: string;
    closeLabel: string;
    selectedTag: string;
    addAnotherTitle: string;
    addAnotherSubtitle: string;
    switchError: string;
  };
  topbar: {
    tourLabel: string;
    addMedicationLabel: string;
    addExamLabel: string;
    signOutLabel: string;
  };
  trialBar: {
    badgeTemplate: string;
    body: string;
    bodyBold: string;
    bodySuffix: string;
    ctaLabel: string;
  };
  pausedBanner: {
    pausedTitle: string;
    pausedBody: string;
    canceledTitle: string;
    canceledBody: string;
    ctaLabel: string;
  };
  nav: FamilyNavSectionContent[];
  areas: Record<string, FamilyAreaCopy>;
  placeholders: Record<string, FamilyPlaceholderContent>;
  guia: {
    tourNote: string;
  };
  ajustes: FamilyAjustesContent;
  plano: FamilyPlanoContent;
  planLabels: Record<string, string>;
  mobileNav: {
    openLabel: string;
    closeLabel: string;
  };
  hoje: FamilyHojeContent;
  remedios: FamilyRemediosContent;
  consultas: FamilyConsultasContent;
  avisos: FamilyAvisosContent;
  pedidosDeAjuda: FamilyPedidosDeAjudaContent;
  localizacao: FamilyLocalizacaoContent;
  exames: FamilyExamesContent;
  participantes: FamilyParticipantesContent;
}

export interface FamilyConsultasContent {
  loadError: string;
  weekGrid: {
    titleTemplate: string;
    timeColumn: string;
    prevWeek: string;
    nextWeek: string;
    emptyCell: string;
  };
  list: {
    appointmentsTitle: string;
    tasksTitle: string;
    addButton: string;
    todayLabel: string;
    companionTag: string;
    appointmentsEmpty: {
      icon: string;
      title: string;
      description: string;
    };
    tasksEmpty: {
      icon: string;
      title: string;
      description: string;
    };
    completedSection: string;
  };
  tasks: {
    assignedToYou: string;
    assignedToTemplate: string;
    anyoneLabel: string;
    untilTemplate: string;
    metaSeparator: string;
    completeButton: string;
    reopenButton: string;
    editButton: string;
  };
  appointmentModal: {
    newTitle: string;
    editTitle: string;
    titleLabel: string;
    titlePlaceholder: string;
    specialtyLabel: string;
    specialtyPlaceholder: string;
    typeLabel: string;
    dateLabel: string;
    timeLabel: string;
    timeOtherLabel: string;
    datetimeLabel: string;
    locationLabel: string;
    locationPlaceholder: string;
    companionLabel: string;
    companionNone: string;
    preparationLabel: string;
    preparationPlaceholder: string;
    cancel: string;
    save: string;
    saving: string;
    cancelAppointment: string;
    types: Array<{ slug: string; label: string }>;
  };
  taskModal: {
    newTitle: string;
    editTitle: string;
    titleLabel: string;
    titlePlaceholder: string;
    typeLabel: string;
    dueLabel: string;
    assigneeLabel: string;
    assigneeNone: string;
    linkAppointmentLabel: string;
    linkAppointmentNone: string;
    cancel: string;
    save: string;
    saving: string;
    types: Array<{ slug: string; label: string }>;
  };
  feedback: {
    appointmentSaved: string;
    appointmentCancelled: string;
    taskSaved: string;
    taskCompleted: string;
    taskReopened: string;
  };
  errors: {
    titleRequired: string;
    datetimeRequired: string;
    datetimeInvalid: string;
    taskTitleRequired: string;
    invalidCompanion: string;
    invalidLinkedAppointment: string;
    noPermission: string;
    paused: string;
    generic: string;
  };
}

export interface FamilyRemediosContent {
  loadError: string;
  refillBanner: {
    title: string;
    body: string;
  };
  listCard: {
    title: string;
    addButton: string;
    detailButton: string;
  };
  listTags: {
    asNeeded: string;
    noSchedule: string;
    warnDays: string;
    okDays: string;
    noReminder: string;
  };
  empty: {
    icon: string;
    title: string;
    description: string;
    cta: string;
  };
  detail: {
    titleSuffix: string;
    stats: {
      quantityLabel: string;
      quantityHint: string;
      dailyLabel: string;
      dailyHint: string;
      durationLabel: string;
      durationHint: string;
      remainingLabel: string;
      remainingHint: string;
    };
    startedLabel: string;
    endsLabel: string;
    consumedTemplate: string;
    buyUntilTemplate: string;
    scheduledTitle: string;
    actions: {
      registerPurchase: string;
      editSchedule: string;
      editScheduleSoon: string;
      pause: string;
      pauseConfirm: string;
    };
    pauseSuccess: string;
  };
  scheduledAlerts: {
    refillDays: string;
    endsTomorrow: string;
    lastPill: string;
    registerPurchase: string;
    sentAt: string;
    scheduledFor: string;
    recipients: string;
  };
  recentReminders: {
    title: string;
    empty: string;
    reminderSent: string;
    notConfirmed: string;
    manualConfirmation: string;
    refillWarning: string;
    voiceFallback: string;
  };
  howWeWrite: {
    title: string;
    saysTitle: string;
    saysItems: string[];
    neverTitle: string;
    neverItems: string[];
  };
  modal: {
    titleNew: string;
    titleReplacement: string;
    fields: {
      name: string;
      dosage: string;
      quantity: string;
      doseUnits: string;
      dosesPerDay: string;
      startDate: string;
      times: string;
      instructions: string;
    };
    previewTitle: string;
    previewDaily: string;
    previewDuration: string;
    previewEnd: string;
    previewBuyUntil: string;
    previewInvalid: string;
    timesMismatch: string;
    cancel: string;
    save: string;
    saving: string;
    successNew: string;
    genericError: string;
    pausedHint: string;
    viewerHint: string;
  };
  pausedActionHint: string;
}

export interface FamilyChecklistTaskContent {
  title: string;
  subtitle: string;
  durationTag: string;
  ctaLabel: string;
  href: string;
  durationTone?: "ok" | "muted";
}

export interface FamilyHojeContent {
  primeiroAcesso: {
    welcomeNamed: string;
    welcomeNeutral: string;
    intro: string;
    checklistTitle: string;
    progressFeitas: string;
    checklistFooter: string;
    dayCardTitle: string;
    tourTitle: string;
    tourBody: string;
    tourPrimary: string;
    tourSecondary: string;
    emptyPanelTitle: string;
    emptyPanelItems: Array<{
      id: string;
      icon: string;
      title: string;
      getStatus: "medications" | "members" | "geo" | "exams" | "sos";
      ctaLabel?: string;
      href?: string;
      tag?: string;
    }>;
    whatsAppCardTitle: string;
    whatsAppIntro: string;
    whatsAppBubble: string;
    whatsAppNote: string;
    whatsAppCta: string;
    viewerHint: string;
    pausedHint: string;
  };
  maduro: {
    urgencyCalm: string;
    urgencyAlert: string;
    reminderNote: string;
    stats: {
      nextLabel: string;
      nextEmpty: string;
      refillLabel: string;
      refillEmpty: string;
      refillHint: string;
      locationLabel: string;
      locationValue: string;
      locationHint: string;
      noticesLabel: string;
      noticesValue: string;
      noticesHint: string;
    };
    timelineCardTitle: string;
    weekButton: string;
    centralTitle: string;
    centralProgressProntas: string;
    centralFooter: string;
    centralTour: string;
    checklistAreas: Array<{
      id: string;
      labelDone: string;
      labelPending: string;
      href?: string;
    }>;
    needsTitle: string;
    needsEmpty: string;
    needsBuyTitle: string;
    needsBuySubtitle: string;
    weeklyTitle: string;
    weeklyTag: string;
    weeklyBody: string;
    weeklyExtra: string;
    activityTitle: string;
    activityEmpty: string;
  };
  checklistTasks: FamilyChecklistTaskContent[];
  welcomeModal: {
    titleNamed: string;
    titleNeutral: string;
    body: string;
    tourNote: string;
    primary: string;
    secondary: string;
    footer: string;
    storageKeyPrefix: string;
  };
  timeline: {
    completedStatus: string;
    reminderSent: string;
    notConfirmed: string;
    confirmed: string;
    upcoming: string;
    refillTitle: string;
    refillSubtitle: string;
    refillLink: string;
  };
  activity: {
    reminderSent: string;
    refillWarning: string;
    manualConfirmation: string;
    medicationAdded: string;
    emptyToday: string;
  };
  emptyDay: {
    icon: string;
    title: string;
    description: string;
    cta: string;
  };
  loadError: {
    title: string;
    description: string;
  };
}

export interface FamilyExamesContent {
  loadError: string;
  searchPlaceholder: string;
  filters: {
    all: string;
    blood: string;
    image: string;
    cardiology: string;
    prescriptions: string;
  };
  table: {
    examColumn: string;
    dateColumn: string;
    providerColumn: string;
    categoryColumn: string;
    visibilityColumn: string;
    openButton: string;
    addButton: string;
    emptyTitle: string;
    emptyDescription: string;
    notFoundTitle: string;
    notFoundDescription: string;
    selectPrompt: string;
    hiddenFooter: string;
  };
  categories: {
    uncategorized: string;
    defineCategory: string;
    blood: string;
    image: string;
    cardiology: string;
    prescriptions: string;
    other: string;
  };
  visibility: {
    family: string;
    familyPlus: string;
    adminHint: string;
  };
  detail: {
    download: string;
    share: string;
    delete: string;
    edit: string;
    previewFallback: string;
    openNewTab: string;
    fields: {
      name: string;
      examDate: string;
      provider: string;
      category: string;
      notes: string;
    };
    addedByTemplate: string;
    deleteConfirm: string;
  };
  autoRead: {
    title: string;
    tag: string;
    body: string;
    neverTitle: string;
    neverBody: string;
  };
  uploadModal: {
    title: string;
    dropHint: string;
    chooseFile: string;
    fileHint: string;
    uploading: string;
    uploaded: string;
    fields: {
      name: string;
      examDate: string;
      provider: string;
      category: string;
      notes: string;
      visibility: string;
    };
    categoryPlaceholder: string;
    cancel: string;
    save: string;
    saving: string;
    viewerHint: string;
    pausedHint: string;
  };
  shareModal: {
    title: string;
    body: string;
    securityNote: string;
    durations: {
      "1h": string;
      "4h": string;
      today: string;
    };
    copyButton: string;
    copied: string;
    cancel: string;
    generate: string;
    generating: string;
  };
  sharePublic: {
    expiredTitle: string;
    expiredBody: string;
    download: string;
  };
  hoje: {
    needsTitle: string;
    needsSubtitleTemplate: string;
  };
  errors: {
    uploadFailed: string;
    saveFailed: string;
    invalidFile: string;
    quotaExceeded: string;
    nameRequired: string;
    dateRequired: string;
  };
}

export interface FamilyParticipantesContent {
  loadError: string;
  selfSuffix: string;
  emergencyPhoneNote: string;
  listCard: {
    titleTemplate: string;
    inviteButton: string;
    resendButton: string;
  };
  situation: Record<
    "active" | "pending" | "expired",
    { label: string; tone: "ok" | "warning" | "muted" }
  >;
  matrix: {
    title: string;
    legend: string;
    roleHeaders: Record<
      "admin" | "caregiver" | "viewer" | "emergency_contact",
      string
    >;
  };
  modal: {
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    relationshipLabel: string;
    relationshipPlaceholder: string;
    contactLabel: string;
    contactPlaceholder: string;
    roleLabel: string;
    rolesHint: string;
    cancel: string;
    submit: string;
    submitting: string;
    nameRequired: string;
    contactInvalid: string;
    duplicatePending: string;
    duplicateActive: string;
    genericError: string;
    roles: Array<{ slug: string; label: string; description: string }>;
  };
  feedback: {
    inviteCreated: string;
    inviteResent: string;
    emergencyActive: string;
    copyLink: string;
    copied: string;
    resendError: string;
    validityNote: string;
    manualShareNote: string;
  };
  accept: {
    title: string;
    expiredTitle: string;
    expiredBody: string;
    alreadyAcceptedTitle: string;
    alreadyAcceptedBody: string;
    notFoundTitle: string;
    notFoundBody: string;
    emailMismatchTitle: string;
    emailMismatchBody: string;
    invitedByTemplate: string;
    roleTemplate: string;
    recipientTemplate: string;
    loginCta: string;
    acceptCta: string;
    accepting: string;
    enterPanelCta: string;
    successMessage: string;
  };
  viewerHint: string;
  pausedHint: string;
}

export interface FamilyPedidosDeAjudaContent {
  loadError: string;
  disclaimer: {
    icon: string;
    body: string;
    samu: string;
    bombeiros: string;
    elderNote: string;
  };
  lastAlert: {
    title: string;
    emptyIcon: string;
    emptyTitle: string;
    emptyDescription: string;
    resolveButton: string;
    pdfButton: string;
    pdfSoon: string;
    mapButton: string;
    mapDisabledHint: string;
    fields: {
      person: string;
      time: string;
      alertType: string;
      location: string;
      callback: string;
      notified: string;
      outcome: string;
    };
  };
  escalation: {
    title: string;
    changeOrderButton: string;
    emptyHint: string;
    invalidWarning: string;
    singleContactWarning: string;
    saveSuccess: string;
    channels: {
      adminChannel: string;
      caregiverChannel: string;
      viewerChannel: string;
      emergencyImmediate: string;
      emergencyDelayed: string;
    };
    roleLabels: Record<
      "admin" | "caregiver" | "viewer" | "emergency_contact",
      string
    >;
    modal: {
      title: string;
      hint: string;
      viewerOptInHint: string;
      includeViewerButton: string;
      saveButton: string;
      saving: string;
      cancel: string;
      moveUp: string;
      moveDown: string;
    };
  };
  history: {
    title: string;
    testButton: string;
    testModalTitle: string;
    testModalBody: string;
    testModalClose: string;
    sosIcon: string;
    cancelledIcon: string;
    summary: {
      resolvedInMinutes: string;
      resolvedWithNote: string;
      cancelled: string;
      open: string;
    };
  };
  detail: {
    headline: string;
    personTemplate: string;
    alertType: string;
    locationUnavailable: string;
    locationAccuracy: string;
    locationTime: string;
    locationZone: string;
    locationInsideZone: string;
    notifiedLineTemplate: string;
    notifiedPending: string;
    outcomeWithNote: string;
    outcomeWithoutNote: string;
    callbackUnavailable: string;
  };
  resolve: {
    title: string;
    noteLabel: string;
    notePlaceholder: string;
    confirm: string;
    saving: string;
    cancel: string;
    saveSuccess: string;
  };
  hoje: {
    needsTitle: string;
    needsSubtitle: string;
    timelineTriggered: string;
    timelineResolved: string;
    emptyPanelConfigured: string;
    emptyPanelPending: string;
  };
  errors: {
    incompleteAccount: string;
    accessDenied: string;
    loadFailed: string;
    escalationForbidden: string;
    accountPaused: string;
    invalidEscalation: string;
    saveFailed: string;
    resolveForbidden: string;
    invalidResolve: string;
    alertNotFound: string;
    alreadyResolved: string;
    concurrentResolve: string;
  };
}

export interface FamilyLocalizacaoContent {
  loadError: string;
  consent: {
    activeTitle: string;
    activeBody: string;
    pendingTitle: string;
    pendingBody: string;
    revokedTitle: string;
    revokedBody: string;
    footer: string;
  };
  map: {
    title: string;
    emptyTitle: string;
    emptyDescription: string;
    frozenHint: string;
    pinLabel: string;
    zoneSafe: string;
    zoneOutside: string;
    accuracy: string;
    openExternal: string;
    shareQuickButton: string;
  };
  stats: {
    updated: string;
    battery: string;
    permission: string;
    signal: string;
    empty: string;
    deviceHint: string;
    batteryHint: string;
    permissionActive: string;
    permissionInactive: string;
    permissionHintActive: string;
    signalHintOk: string;
  };
  relativeTime: {
    justNow: string;
    minutes: string;
    hours: string;
    days: string;
  };
  places: {
    title: string;
    addButton: string;
    editButton: string;
    emptyTitle: string;
    emptyDescription: string;
    tagPending: string;
    tagInside: string;
    tagOutside: string;
    subtitlePending: string;
    subtitleConfirmed: string;
    alertOnExitSuffix: string;
  };
  placeModal: {
    addTitle: string;
    editTitle: string;
    nameLabel: string;
    addressLabel: string;
    radiusLabel: string;
    iconLabel: string;
    alertOnExitLabel: string;
    alertOnExitHint: string;
    save: string;
    saving: string;
    cancel: string;
    deleteButton: string;
    saveSuccess: string;
    deleteSuccess: string;
  };
  share: {
    title: string;
    body: string;
    createButton: string;
    disabledReason: string;
  };
  shareModal: {
    title: string;
    hint: string;
    durationLabel: string;
    duration1h: string;
    duration3h: string;
    duration24h: string;
    confirm: string;
    creating: string;
    cancel: string;
    success: string;
    readyBody: string;
    copyButton: string;
    copied: string;
    close: string;
  };
  sharePublic: {
    title: string;
    expiredTitle: string;
    expiredBody: string;
    openMap: string;
    privacyNote: string;
  };
  history: {
    title: string;
    filterTag: string;
    emptyTitle: string;
    emptyDescription: string;
    columns: {
      when: string;
      where: string;
      situation: string;
    };
    situations: {
      safeZone: string;
      zoneExit: string;
      returned: string;
    };
  };
  limitations: {
    title: string;
    paragraphs: string[];
  };
  hoje: {
    statHint: string;
    statOutside: string;
    statUnavailable: string;
    widgetConfigured: string;
    widgetPending: string;
  };
  errors: {
    accessDenied: string;
    loadFailed: string;
    manageForbidden: string;
    shareForbidden: string;
    accountPaused: string;
    invalidPlace: string;
    invalidShare: string;
    placeNotFound: string;
    cannotDeleteHome: string;
    alertNeedsCoords: string;
    shareUnavailable: string;
    saveFailed: string;
  };
}

export const familyRoutes = {
  hoje: "/familia",
  remedios: "/familia/remedios",
  consultas: "/familia/consultas",
  avisos: "/familia/avisos",
  pedidosDeAjuda: "/familia/pedidos-de-ajuda",
  localizacao: "/familia/localizacao",
  exames: "/familia/exames",
  guia: "/familia/guia",
  participantes: "/familia/participantes",
  plano: "/familia/plano",
  ajustes: "/familia/ajustes",
} as const;

export const familyContent: FamilyContent = {
  brand: {
    name: "Zelita",
  },
  recipientPicker: {
    switchLabel: "trocar ⌄",
    ageUnknown: "idade não informada",
    modalTitle: "Quem você quer acompanhar",
    closeLabel: "Fechar",
    selectedTag: "Selecionado",
    addAnotherTitle: "Cadastrar outra pessoa",
    addAnotherSubtitle: "Disponível no plano Família · em breve",
    switchError:
      "Não foi possível trocar de conta agora. Tente de novo ou entre novamente.",
  },
  topbar: {
    tourLabel: "🎓 Tour",
    addMedicationLabel: "+ Remédio",
    addExamLabel: "+ Exame",
    signOutLabel: "Sair",
  },
  trialBar: {
    badgeTemplate: "Dia {current} de {total}",
    body: "Você está no ",
    bodyBold: "período grátis",
    bodySuffix:
      ". Nenhum cartão foi pedido e nada será cobrado — avisamos 5 dias antes de acabar.",
    ctaLabel: "Ver meu plano",
  },
  pausedBanner: {
    pausedTitle: "Conta pausada",
    pausedBody:
      "Seus dados estão preservados, mas algumas ações ficam limitadas até reativar o plano.",
    canceledTitle: "Conta cancelada",
    canceledBody:
      "O acesso ao painel continua disponível para consulta. Veja Meu plano ou fale com o suporte para reativar.",
    ctaLabel: "Ver meu plano",
  },
  nav: [
    {
      items: [
        {
          id: "hoje",
          emoji: "◉",
          label: "Hoje",
          path: familyRoutes.hoje,
        },
        {
          id: "remedios",
          emoji: "💊",
          label: "Remédios",
          path: familyRoutes.remedios,
        },
        {
          id: "consultas",
          emoji: "🗓",
          label: "Consultas e tarefas",
          path: familyRoutes.consultas,
        },
        {
          id: "avisos",
          emoji: "🔔",
          label: "Avisos",
          path: familyRoutes.avisos,
        },
      ],
    },
    {
      label: "Segurança",
      items: [
        {
          id: "pedidos-de-ajuda",
          emoji: "🆘",
          label: "Pedidos de ajuda",
          path: familyRoutes.pedidosDeAjuda,
        },
        {
          id: "localizacao",
          emoji: "📍",
          label: "Onde ele está",
          path: familyRoutes.localizacao,
        },
      ],
    },
    {
      label: "Saúde",
      items: [
        {
          id: "exames",
          emoji: "📄",
          label: "Exames e receitas",
          path: familyRoutes.exames,
        },
      ],
    },
    {
      label: "Ajuda",
      items: [
        {
          id: "guia",
          emoji: "🎓",
          label: "Como usar a Zelita",
          path: familyRoutes.guia,
        },
      ],
    },
    {
      label: "Conta",
      items: [
        {
          id: "participantes",
          emoji: "👥",
          label: "Quem participa",
          path: familyRoutes.participantes,
        },
        {
          id: "plano",
          emoji: "💳",
          label: "Meu plano",
          path: familyRoutes.plano,
        },
        {
          id: "ajustes",
          emoji: "⚙",
          label: "Ajustes",
          path: familyRoutes.ajustes,
        },
      ],
    },
  ],
  areas: {
    hoje: {
      title: "Hoje",
      subtitle: "Como está o dia do {apelido}",
    },
    remedios: {
      title: "Remédios",
      subtitle: "O que ele toma e quando comprar mais",
    },
    consultas: {
      title: "Consultas e tarefas",
      subtitle: "A semana dele e quem faz o quê",
    },
    avisos: {
      title: "Avisos",
      subtitle: "Tudo que a Zelita te avisou",
    },
    "pedidos-de-ajuda": {
      title: "Pedidos de ajuda",
      subtitle: "Quando ele apertou o botão e o que aconteceu",
    },
    localizacao: {
      title: "Onde ele está",
      subtitle: "Só para você ficar tranquila",
    },
    exames: {
      title: "Exames e receitas",
      subtitle: "Guarde aqui e ache na hora da consulta",
    },
    guia: {
      title: "Como usar a Zelita",
      subtitle:
        "Cada função explicada: o que é, para que serve e como usar",
    },
    participantes: {
      title: "Quem participa",
      subtitle: "Irmãos, cuidadores e quem chamar numa emergência",
    },
    plano: {
      title: "Meu plano",
      subtitle: "O que você paga e o que está incluído",
    },
    ajustes: {
      title: "Ajustes",
      subtitle: "Como a Zelita fala com ele",
    },
  },
  placeholders: {
    consultas: {
      icon: "🗓",
      title: "Consultas e tarefas em breve",
      description:
        "Aqui você verá consultas, exames marcados e tarefas da semana — quem leva, quem acompanha e o que falta fazer.",
    },
    avisos: {
      icon: "🔔",
      title: "Seus avisos aparecerão aqui",
      description:
        "Quando a Zelita avisar sobre remédios, pedidos de ajuda ou outras situações, tudo ficará registrado nesta área.",
    },
    "pedidos-de-ajuda": {
      icon: "🆘",
      title: "Histórico de pedidos de ajuda",
      description:
        "Quando ele apertar o botão de ajuda, você verá aqui o que aconteceu, quem foi avisado e em que ordem.",
    },
    localizacao: {
      icon: "📍",
      title: "Localização em breve",
      description:
        "A última localização conhecida e os lugares de sempre ficarão aqui — sempre com autorização dele.",
    },
    exames: {
      icon: "📄",
      title: "Exames e receitas em breve",
      description:
        "Guarde fotos de exames e receitas para achar na hora da consulta, sem procurar em gavetas.",
    },
    guia: {
      icon: "🎓",
      title: "Guia da Zelita",
      description:
        "Cada função do painel explicada em palavras simples. O tour interativo de 1 minuto virá em uma atualização futura.",
    },
    participantes: {
      icon: "👥",
      title: "Quem participa em breve",
      description:
        "Convide irmãos, cuidadores e contatos de emergência. Cada pessoa verá só o que você permitir.",
    },
    plano: {
      icon: "💳",
      title: "Seu plano em breve",
      description:
        "Trial, uso e detalhes do que está incluído no seu plano aparecerão aqui — sem surpresas na cobrança.",
    },
    ajustes: {
      icon: "⚙",
      title: "Ajustes em breve",
      description:
        "Canais, tom das mensagens e preferências de privacidade ficarão aqui. Por enquanto, use Sair para encerrar a sessão.",
    },
  },
  guia: {
    tourNote:
      "O tour interativo de 1 minuto virá em uma atualização futura. Enquanto isso, leia cada seção abaixo no seu tempo.",
  },
  ajustes: {
    signOutDescription: "Encerra sua sessão neste aparelho.",
    readOnlyNote:
      "Somente administradores alteram estas configurações.",
    pausedHint:
      "Conta pausada: você pode ver as configurações, mas não alterá-las até reativar o plano.",
    errors: {
      loadTitle: "Não foi possível abrir Ajustes",
      loadFailed:
        "Algo deu errado ao carregar esta área. Tente recarregar a página.",
      accessDenied:
        "Seu papel não permite ver Ajustes. Peça acesso ao administrador da conta.",
      incomplete:
        "Complete o cadastro da pessoa cuidada para ver os ajustes.",
      forbidden: "Você não pode alterar estas configurações.",
      accountPaused:
        "Conta pausada: alterações ficam bloqueadas até reativar o plano.",
      invalidPayload: "Revise os campos e tente de novo.",
      saveFailed:
        "Não foi possível salvar agora. Tente de novo em instantes.",
    },
    channels: {
      cardTitle: "Como falamos com ele",
      cardIcon: "💬",
      whatsappTitle: "WhatsApp",
      whatsappSubtitle: "Canal principal · texto, áudio e links",
      voiceTitle: "Ligação de voz",
      voiceSubtitle: "Reforço quando não há leitura em 20 min",
      shortcutTitle: "Atalho no celular dele",
      shortcutSubtitle: "Ícone na tela inicial — opcional",
      videoTitle: "Videochamada",
      howItWorks: "Como funciona",
      saveButton: "Salvar canal",
      saveSuccess: "Canal atualizado.",
      optInPendingNote:
        "Lembretes recorrentes só começam depois que ele aceitar no WhatsApp.",
      tags: {
        active: "Ativo",
        pending: "Pendente",
        inactive: "Inativo",
        notLinked: "Não vinculado",
        unavailable: "Não disponível",
      },
      options: [
        {
          slug: "whatsapp",
          title: "Só WhatsApp",
          description:
            "Mensagem escrita no horário do remédio, com opção de áudio gravado na voz da família.",
        },
        {
          slug: "whatsapp_voice",
          title: "WhatsApp e, se não ler, ligação",
          description:
            "Para quem tem pouca familiaridade com celular ou toma remédio crítico: sem leitura em 20 minutos, a Zelita liga.",
        },
        {
          slug: "voice_only",
          title: "Só ligação",
          description: "Para quem não usa WhatsApp.",
        },
      ],
    },
    tone: {
      cardTitle: "Tom e horários",
      cardIcon: "🕐",
      toneLabel: "Como a Zelita fala com ele",
      dndBeforeLabel: "Não incomodar antes de",
      dndAfterLabel: "Não incomodar depois de",
      previewTitleTemplate: "Prévia da mensagem das {hora}",
      previewEmptyHint:
        "Cadastre um remédio para ver exemplo com nome e horário.",
      toneNote:
        "A Zelita nunca usa tom de cobrança, ameaça ou vigilância — nada de “você ainda não tomou” ou “estamos monitorando você”.",
      saveButton: "Salvar tom e horários",
      saveSuccess: "Tom e horários atualizados.",
      tones: [
        { slug: "carinhoso", label: "Carinhoso" },
        { slug: "direto", label: "Direto" },
        { slug: "formal", label: "Formal" },
      ],
    },
    privacy: {
      cardTitle: "Privacidade e autorizações",
      cardIcon: "🔒",
      messagesTitle: "Autorização de mensagens",
      messagesSubtitleActive:
        "Aceita por {apelido} em {data} no WhatsApp",
      messagesSubtitlePending:
        "Antes do primeiro lembrete recorrente, a Zelita se apresenta e pede autorização dele no canal.",
      geoTitle: "Autorização de localização",
      geoSubtitleActive:
        "Aceita em {data} · revogável a qualquer momento por ele",
      geoSubtitlePending:
        "Ainda não autorizado — disponível no app dele quando você instalar.",
      geoSubtitleRevoked:
        "Revogada por ele — pode autorizar de novo no app quando quiser.",
      healthTitle: "Dados de saúde",
      healthSubtitle:
        "Exames ficam criptografados e só aparecem para quem você autorizar na conta.",
      lgpdTitle: "Exportar ou excluir todos os dados",
      lgpdSubtitle: "Direitos previstos na LGPD",
      lgpdButton: "Solicitar",
      loginTitle: "Como você entra",
      loginSubtitle: "Código por e-mail neste aparelho",
      devicesTitle: "Aparelhos com acesso",
      devicesSubtitle: "Nenhum aparelho vinculado ainda",
      devicesManageButton: "Gerenciar",
      accessLogTitle: "Últimos acessos à conta",
      accessLogButton: "Ver",
      tags: {
        current: "Vigente",
        pending: "Pendente",
        revoked: "Revogada",
        active: "Ativa",
      },
    },
    recipient: {
      cardTitleTemplate: "Dados do {apelido}",
      editButton: "Editar",
      saveSuccess: "Dados atualizados.",
      fields: {
        fullName: "Nome completo",
        displayName: "Como chamamos",
        birthDate: "Nascimento",
        whatsapp: "WhatsApp",
        address: "Endereço",
      },
      modal: {
        title: "Editar dados",
        fullNameLabel: "Nome completo",
        displayNameLabel: "Como chamamos",
        birthDateLabel: "Data de nascimento",
        whatsappLabel: "WhatsApp",
        addressLabel: "Endereço",
        saveButton: "Salvar",
        cancelButton: "Cancelar",
        validationSummary: "Revise os campos destacados.",
      },
    },
    lgpdModal: {
      title: "Solicitar dados (LGPD)",
      typeLabel: "O que você precisa?",
      exportOption: "Exportar cópia dos meus dados",
      deleteOption: "Excluir todos os dados da conta",
      deadlineNote:
        "Respondemos em até 15 dias úteis. Não há download imediato nem exclusão automática nesta etapa.",
      confirmLabel:
        "Entendo que a equipe Zelita vai analisar manualmente este pedido.",
      submitButton: "Confirmar solicitação",
      cancelButton: "Cancelar",
      successMessage: "Recebemos sua solicitação.",
    },
    accessLogModal: {
      title: "Últimos acessos",
      body: "Registro completo em breve. Por enquanto, use Sair para encerrar a sessão neste aparelho.",
      closeButton: "Fechar",
    },
    signOut: {
      button: "Sair",
    },
  },
  plano: {
    supportMailto: "mailto:suporte@zelita.care?subject=Meu%20plano%20Zelita",
    errors: {
      loadTitle: "Não foi possível abrir Meu plano",
      loadFailed:
        "Algo deu errado ao carregar esta área. Tente recarregar a página.",
      accessDenied:
        "Seu papel não permite ver Meu plano. Só quem administra a conta acessa cobrança e assinatura.",
      incomplete:
        "Complete o cadastro da pessoa cuidada para ver o plano.",
    },
    currentCard: {
      title: "Seu plano",
      tags: {
        active: "Ativo",
        trial: "Período grátis",
        paused: "Pausado",
        canceled: "Cancelado",
      },
      trial: {
        badgeTemplate: "Dia {current} de {total}",
        bodyPrefix: "Você ainda está no ",
        bodyBold: "período grátis",
        bodySuffix:
          ". Faltam {days} dias e nenhuma cobrança foi feita.",
      },
      billing: {
        trialChargeTemplate:
          "Primeira cobrança em {date}, se você confirmar. Avisamos em {warningDate} —",
        trialChargeEmphasis:
          "sem confirmação, a conta pausa e não cobramos nada.",
        postTrialActive:
          "Cobrança recorrente será feita pelo provedor seguro quando você confirmar a assinatura — integração em breve.",
        pausedBody:
          "Seus dados estão preservados, mas lembretes e algumas ações ficam pausados. Reative quando quiser — sem cobrança automática retroativa.",
        canceledBody:
          "O acesso ao painel continua disponível para consulta. Fale com o suporte para reativar — sem cobrança automática.",
        unknownPlan:
          "Não reconhecemos o plano desta conta. Entre em contato com o suporte para confirmar.",
      },
      elderNote:
        "Quem paga é você. O {apelido} nunca vê cobrança, anúncio ou pedido de cartão em nenhuma mensagem — se ele receber algo assim, não é a Zelita.",
      actions: {
        changePlan: "Mudar de plano",
        changeCard: "Trocar cartão",
        invoices: "Notas fiscais",
        reactivate: "Falar com suporte",
      },
    },
    usageCard: {
      title: "Uso este mês",
      whatsapp: {
        label: "Mensagens de WhatsApp",
        unlimitedSuffix: "ilimitado no plano",
      },
      voice: {
        label: "Ligações de voz",
        monthTemplate: "{count} realizadas este mês",
        hint: "Reforço quando não há leitura em 20 min",
      },
      storage: {
        label: "Armazenamento de exames",
        overQuotaHint: "espaço esgotado",
        overQuotaTag: "Atenção",
      },
      members: {
        label: "Pessoas na conta",
        unlimitedSuffix: "ilimitado no plano",
        limitedTemplate: "{limit} incluídas",
      },
    },
    modals: {
      closeLabel: "Fechar",
      changePlan: {
        title: "Mudar de plano",
        essentialTitle: "Essencial · R$ 39/mês",
        essentialBody:
          "WhatsApp, remédios, SOS, até 3 participantes com login, exames com 2 GB. Sem voz e sem localização avançada.",
        cuidadoPlusTitle: "Cuidado+ · R$ 69/mês",
        cuidadoPlusBody:
          "Tudo do Essencial + ligação de reforço, localização avançada, participantes ilimitados e 20 GB de exames.",
        familiaNote:
          "Plano Família (R$ 119/mês) — em breve, para quem cuida de mais de uma pessoa.",
        ctaLabel: "Em breve",
      },
      changeCard: {
        title: "Trocar cartão",
        body: "Disponível quando você confirmar a assinatura no provedor seguro — ainda sem cartão nesta etapa.",
      },
      invoices: {
        title: "Notas fiscais",
        emptyTitle: "Nenhuma nota fiscal ainda",
        body: "Documentos aparecerão aqui depois que a integração de pagamento estiver ativa.",
      },
    },
  },
  planLabels: {
    essential: "Essential",
    cuidado_plus: "Cuidado+",
  },
  mobileNav: {
    openLabel: "Abrir menu",
    closeLabel: "Fechar menu",
  },
  hoje: {
    primeiroAcesso: {
      welcomeNamed: "Bem-vinda, {nome}!",
      welcomeNeutral: "Bem-vindo!",
      intro:
        "A conta do {apelido} está criada. Agora falta o que a Zelita vai cuidar por você — e a primeira tarefa leva 40 segundos.",
      checklistTitle: "Comece por aqui",
      progressFeitas: "{count} de 4 feitas",
      checklistFooter:
        "Não precisa fazer as quatro hoje. Faça a primeira e volte quando der — a Zelita já começa a trabalhar.",
      dayCardTitle: "O dia do {apelido}",
      tourTitle: "Nunca usou a Zelita?",
      tourBody:
        "Um tour de 1 minuto mostra para que serve cada parte do painel, em palavras simples. Você pode sair quando quiser.",
      tourPrimary: "Fazer o tour de 1 minuto",
      tourSecondary: "Prefiro ler no meu tempo",
      emptyPanelTitle: "O que ainda está vazio",
      emptyPanelItems: [
        {
          id: "medications",
          icon: "💊",
          title: "Remédios",
          getStatus: "medications",
          ctaLabel: "Anotar",
          href: familyRoutes.remedios,
        },
        {
          id: "sos",
          icon: "🆘",
          title: "Pedidos de ajuda",
          getStatus: "sos",
          ctaLabel: "Configurar",
          href: familyRoutes.pedidosDeAjuda,
        },
        {
          id: "geo",
          icon: "📍",
          title: "Onde ele está",
          getStatus: "geo",
          tag: "Pendente",
        },
        {
          id: "exams",
          icon: "📄",
          title: "Exames e receitas",
          getStatus: "exams",
          ctaLabel: "Enviar",
          href: `${familyRoutes.exames}?modal=exame`,
        },
      ],
      whatsAppCardTitle: "Enquanto isso, {apelido}…",
      whatsAppIntro:
        "Recebeu no WhatsApp a mensagem da Zelita se apresentando e pedindo autorização.",
      whatsAppNote: "Nada é enviado antes dele aceitar.",
      whatsAppBubble:
        "Olá, {apelido}! Aqui é a Zelita. A sua família me pediu para lembrar o senhor dos remédios e dos compromissos. Posso enviar essas mensagens?",
      whatsAppCta: "Ver a conversa",
      viewerHint:
        "Peça ao administrador da conta para anotar remédios ou concluir estas tarefas.",
      pausedHint:
        "Conta pausada: você pode ver o checklist, mas não cadastrar remédios até reativar o plano.",
    },
    maduro: {
      urgencyCalm: "nada urgente com {apelido} agora",
      urgencyAlert:
        "atenção: remédio de {apelido} está acabando — veja abaixo",
      reminderNote:
        "A Zelita nunca diz que ele tomou o remédio. Ela só sabe que mandou o lembrete. Enquanto uma pessoa não confirmar, aparece “lembrete enviado” — e só você, ele ou a cuidadora podem confirmar de verdade.",
      stats: {
        nextLabel: "Próximo remédio",
        nextEmpty: "—",
        refillLabel: "Remédio acabando",
        refillEmpty: "0",
        refillHint: "{nome} acaba em {dias} dias",
        locationLabel: "Onde ele está",
        locationValue: "Em breve",
        locationHint: "Disponível após autorização",
        noticesLabel: "Avisos para ver",
        noticesValue: "0",
        noticesHint: "Histórico em breve",
      },
      timelineCardTitle: "O dia do {apelido}",
      weekButton: "Ver semana",
      centralTitle: "Sua central",
      centralProgressProntas: "{count} de 4 prontas",
      centralFooter:
        "Não tem pressa. Cada coisa que entra aqui é uma a menos para você lembrar.",
      centralTour: "🎓 Rever o tour",
      checklistAreas: [
        {
          id: "medications",
          labelDone: "Remédios · {detail}",
          labelPending: "Remédios · anote o primeiro",
          href: familyRoutes.remedios,
        },
        {
          id: "sos",
          labelDone: "Botão de ajuda · configure contatos",
          labelPending: "Botão de ajuda · configure em Pedidos de ajuda",
          href: familyRoutes.pedidosDeAjuda,
        },
        {
          id: "members",
          labelDone: "Família · {detail} participantes",
          labelPending: "Família · convide alguém",
          href: familyRoutes.participantes,
        },
        {
          id: "exams",
          labelDone: "Exames · {detail} guardados",
          labelPending: "Exames · envie quando tiver",
          href: familyRoutes.exames,
        },
      ],
      needsTitle: "Precisa de você",
      needsEmpty:
        "Nada urgente por enquanto. Complete o checklist quando puder — sem pressa.",
      needsBuyTitle: "Comprar {medicamento}",
      needsBuySubtitle: "Acaba em {fim} · compre até {comprar}",
      weeklyTitle: "Resumo da semana",
      weeklyTag: "Em breve",
      weeklyBody:
        "Toda segunda, um resumo curto do que aconteceu: os lembretes, os remédios que estão acabando, os exames novos e o que mudou na rotina. Escrito em português simples, pronto para você mandar no grupo dos irmãos.",
      weeklyExtra:
        "Também está no plano: avisar quando algo sair do comum — por exemplo, dois dias seguidos sem nenhuma resposta dele.",
      activityTitle: "Atividade recente da família",
      activityEmpty: "Nada registrado ainda hoje",
    },
    checklistTasks: [
      {
        title: "Anote um remédio que ele toma",
        subtitle:
          "Copie o que está na caixa. A Zelita calcula sozinha quando vai acabar e te avisa antes.",
        durationTag: "40 segundos",
        ctaLabel: "Fazer agora",
        href: familyRoutes.remedios,
        durationTone: "ok",
      },
      {
        title: "Diga quem chamar numa emergência",
        subtitle:
          "Sem isso, o botão de ajuda avisa só você. Com dois contatos, ele avisa a família toda.",
        durationTag: "1 minuto",
        ctaLabel: "Adicionar",
        href: familyRoutes.pedidosDeAjuda,
      },
      {
        title: "Chame um irmão ou a cuidadora",
        subtitle:
          "Quem cuida sozinha se cansa. Cada pessoa vê só o que você permitir.",
        durationTag: "1 minuto",
        ctaLabel: "Convidar",
        href: `${familyRoutes.participantes}?modal=convite`,
      },
      {
        title: "Guarde um exame ou uma receita",
        subtitle:
          "Tire foto do papel. Na próxima consulta você acha em dois toques.",
        durationTag: "30 segundos",
        ctaLabel: "Enviar",
        href: familyRoutes.exames,
      },
    ],
    welcomeModal: {
      titleNamed: "Sua conta está pronta, {nome}!",
      titleNeutral: "Sua conta está pronta!",
      body: "Você tem {dias} dias grátis com tudo liberado. Quer que eu te mostre o painel em 1 minuto?",
      tourNote:
        "Tour de 1 minuto — você pode sair a qualquer momento.",
      primary: "Sim, me mostre o painel",
      secondary: "Prefiro explorar sozinha",
      footer: "Depois você acha o tour no botão 🎓 Tour, no alto da tela.",
      storageKeyPrefix: "zelita:welcome-dismissed:",
    },
    timeline: {
      completedStatus: "concluído",
      reminderSent: "{medicamento} — lembrete enviado no WhatsApp",
      notConfirmed: "tomada não confirmada",
      confirmed: "tomada confirmada manualmente",
      upcoming: "{medicamento} — lembrete será enviado",
      refillTitle: "A {medicamento} deve acabar em {dias} dias",
      refillSubtitle: "Compre outra caixa até {data}",
      refillLink: "anotar a nova caixa",
    },
    activity: {
      reminderSent: "lembrete enviado — {medicamento}",
      refillWarning: "aviso de cartela — {medicamento}",
      manualConfirmation: "confirmou tomada — {medicamento}",
      medicationAdded: "Você anotou {medicamento}",
      emptyToday: "Nada registrado ainda hoje",
    },
    emptyDay: {
      icon: "💊",
      title: "Nenhum remédio anotado ainda",
      description:
        "Quando você anotar o primeiro, o dia dele aparece aqui: cada horário, se o lembrete foi enviado e quantos dias faltam para a caixa acabar.",
      cta: "Anotar o primeiro remédio",
    },
    loadError: {
      title: "Não deu para carregar o Hoje",
      description:
        "Algo falhou ao buscar os dados. Recarregue a página ou tente de novo em instantes.",
    },
  },
  remedios: {
    loadError:
      "Não foi possível carregar os remédios agora. Recarregue a página ou tente de novo em instantes.",
    refillBanner: {
      title: "Atenção: um remédio está acabando.",
      body: "A caixa de {medicamento} deve terminar em {data}. Confirme com o idoso ou cuidador quantos comprimidos ainda tem e anote aqui a caixa nova.",
    },
    listCard: {
      title: "Remédios que ele toma",
      addButton: "+ Adicionar remédio",
      detailButton: "Detalhe",
    },
    listTags: {
      asNeeded: "Se necessário · sem horário fixo",
      noSchedule: "Sem horário fixo",
      warnDays: "Faltam {dias} dias",
      okDays: "{dias} dias restantes",
      noReminder: "Sem lembrete",
    },
    empty: {
      icon: "💊",
      title: "Nenhum remédio anotado ainda",
      description:
        "Anote o primeiro remédio que ele toma. A Zelita calcula quando a caixa acaba e te avisa antes — sem afirmar que ele tomou.",
      cta: "+ Adicionar remédio",
    },
    detail: {
      titleSuffix: "— cartela atual",
      stats: {
        quantityLabel: "Vieram na caixa",
        quantityHint: "comprimidos",
        dailyLabel: "Ele toma por dia",
        dailyHint: "comprimido",
        durationLabel: "A caixa dura",
        durationHint: "dias",
        remainingLabel: "Ainda dá para",
        remainingHint: "dias",
      },
      startedLabel: "Começou em {data}",
      endsLabel: "Deve acabar em {data}",
      consumedTemplate:
        "Pela conta, já foram {consumido} dos {total} comprimidos.",
      buyUntilTemplate: "Compre outra caixa até {data}",
      scheduledTitle: "Avisos programados desta cartela",
      actions: {
        registerPurchase: "Cadastrar nova compra",
        editSchedule: "Editar horários",
        editScheduleSoon: "Em breve",
        pause: "Pausar lembretes",
        pauseConfirm:
          "Pausar lembretes desta cartela? Isso não significa que ele parou de tomar o remédio.",
      },
      pauseSuccess: "Cartela pausada. Lembretes desta cartela param.",
    },
    scheduledAlerts: {
      refillDays: "Faltam {dias} dias",
      endsTomorrow: "Termina amanhã",
      lastPill: "Último comprimido",
      registerPurchase: "Cadastre nova compra",
      sentAt: "Enviado {data}",
      scheduledFor: "Programado {data}",
      recipients: "administradores da conta",
    },
    recentReminders: {
      title: "Últimos lembretes",
      empty: "Nenhum lembrete registrado ainda",
      reminderSent: "Lembrete enviado",
      notConfirmed: "tomada não confirmada",
      manualConfirmation: "confirmado por {ator}",
      refillWarning: "Aviso de cartela acabando",
      voiceFallback: "Ligação de reforço após lembrete",
    },
    howWeWrite: {
      title: "Como escrevemos",
      saysTitle: "✓ A Zelita diz",
      saysItems: [
        "Lembrete enviado",
        "Tomada não confirmada",
        "Cartela prevista para terminar hoje",
        "Verifique com o idoso ou cuidador",
        "Atenção: medicamento próximo do fim",
      ],
      neverTitle: "✕ A Zelita nunca diz",
      neverItems: ["O idoso tomou o medicamento", "Dose garantida"],
    },
    modal: {
      titleNew: "Nova cartela",
      titleReplacement: "Nova cartela",
      fields: {
        name: "Medicamento",
        dosage: "Dosagem",
        quantity: "Comprimidos na cartela",
        doseUnits: "Comprimidos por dose",
        dosesPerDay: "Doses por dia",
        startDate: "Início",
        times: "Horários",
        instructions: "Instrução para o idoso (opcional)",
      },
      previewTitle: "A conta é por nossa conta",
      previewDaily: "Ele toma por dia",
      previewDuration: "A caixa dura",
      previewEnd: "Deve acabar em",
      previewBuyUntil: "Compre outra até",
      previewInvalid:
        "Ajuste quantidade e doses para ver quando a cartela termina.",
      timesMismatch:
        "Selecione exatamente {count} horário(s), um por dose do dia.",
      cancel: "Cancelar",
      save: "Salvar cartela",
      saving: "Salvando…",
      successNew: "Remédio anotado. Lembrete enviado ≠ tomada confirmada.",
      genericError:
        "Não foi possível salvar agora. Verifique a conexão e tente de novo.",
      pausedHint:
        "Conta pausada: você pode ver os remédios, mas não cadastrar ou pausar cartelas até reativar o plano.",
      viewerHint:
        "Seu papel não permite cadastrar cartelas. Peça ao admin da conta.",
    },
    pausedActionHint:
      "Conta pausada — ações de cadastro e pausa ficam indisponíveis.",
  },
  consultas: {
    loadError:
      "Não foi possível carregar consultas e tarefas agora. Recarregue a página ou tente de novo em instantes.",
    weekGrid: {
      titleTemplate: "Semana de {inicio} a {fim} de {mes}",
      timeColumn: "Horário",
      prevWeek: "‹ anterior",
      nextWeek: "próxima ›",
      emptyCell: "—",
    },
    list: {
      appointmentsTitle: "Próximas consultas",
      tasksTitle: "Tarefas da família",
      addButton: "+ Adicionar",
      todayLabel: "Hoje",
      companionTag: "{nome} acompanha",
      appointmentsEmpty: {
        icon: "🗓",
        title: "Nenhuma consulta marcada",
        description:
          "Adicione consultas, exames ou fisioterapia para ver na grade da semana.",
      },
      tasksEmpty: {
        icon: "✓",
        title: "Nenhuma tarefa aberta",
        description:
          "Anote o que falta fazer — comprar remédio, ligar para o convênio, levar na consulta.",
      },
      completedSection: "Concluídas",
    },
    tasks: {
      assignedToYou: "atribuída a você",
      assignedToTemplate: "atribuída a {nome}",
      anyoneLabel: "qualquer um da família",
      untilTemplate: "Até {data}",
      metaSeparator: " · ",
      completeButton: "Concluir",
      reopenButton: "Reabrir",
      editButton: "Editar",
    },
    appointmentModal: {
      newTitle: "Nova consulta",
      editTitle: "Editar consulta",
      titleLabel: "O que é",
      titlePlaceholder: "Ex.: Dr. Aurélio ou Fisioterapia",
      specialtyLabel: "Especialidade ou tipo",
      specialtyPlaceholder: "Ex.: cardiologia",
      typeLabel: "Tipo",
      dateLabel: "Data",
      timeLabel: "Horário",
      timeOtherLabel: "Ou escolha outro horário",
      datetimeLabel: "Data e hora",
      locationLabel: "Local",
      locationPlaceholder: "Clínica, endereço ou sala",
      companionLabel: "Quem acompanha",
      companionNone: "Ninguém designado",
      preparationLabel: "Observação de preparo",
      preparationPlaceholder: "Ex.: jejum de 12h, levar exames",
      cancel: "Cancelar",
      save: "Salvar",
      saving: "Salvando…",
      cancelAppointment: "Cancelar consulta",
      types: [
        { slug: "medical", label: "Consulta médica" },
        { slug: "physio", label: "Fisioterapia" },
        { slug: "exam", label: "Exame / laboratório" },
        { slug: "other", label: "Outro" },
      ],
    },
    taskModal: {
      newTitle: "Nova tarefa",
      editTitle: "Editar tarefa",
      titleLabel: "O que fazer",
      titlePlaceholder: "Ex.: Comprar Losartana",
      typeLabel: "Tipo",
      dueLabel: "Prazo (opcional)",
      assigneeLabel: "Atribuir a",
      assigneeNone: "Qualquer um da família",
      linkAppointmentLabel: "Vincular a consulta",
      linkAppointmentNone: "Nenhuma consulta",
      cancel: "Cancelar",
      save: "Salvar",
      saving: "Salvando…",
      types: [
        { slug: "shopping", label: "Compras" },
        { slug: "call", label: "Ligação" },
        { slug: "transport", label: "Transporte / logística" },
        { slug: "other", label: "Outro" },
      ],
    },
    feedback: {
      appointmentSaved: "Consulta salva.",
      appointmentCancelled: "Consulta cancelada.",
      taskSaved: "Tarefa salva.",
      taskCompleted: "Tarefa concluída.",
      taskReopened: "Tarefa reaberta.",
    },
    errors: {
      titleRequired: "Informe o nome da consulta ou compromisso.",
      datetimeRequired: "Informe data e hora.",
      datetimeInvalid: "Data ou hora inválida.",
      taskTitleRequired: "Informe o que precisa ser feito.",
      invalidCompanion:
        "Escolha outro membro ativo ou deixe em branco — o acompanhante selecionado não está mais na conta.",
      invalidLinkedAppointment:
        "A consulta vinculada não existe ou foi cancelada.",
      noPermission:
        "Seu papel não permite alterar consultas ou tarefas nesta conta.",
      paused:
        "Conta pausada: você pode ver a agenda, mas não alterar até reativar o plano.",
      generic:
        "Não foi possível concluir agora. Verifique a conexão e tente de novo.",
    },
  },
  exames: {
    loadError:
      "Não foi possível carregar exames e receitas agora. Recarregue a página ou tente de novo em instantes.",
    searchPlaceholder: "Buscar por nome, médico, laboratório ou data",
    filters: {
      all: "Todos",
      blood: "Sangue",
      image: "Imagem",
      cardiology: "Cardiologia",
      prescriptions: "Receitas",
    },
    table: {
      examColumn: "Exame",
      dateColumn: "Data",
      providerColumn: "Médico / clínica",
      categoryColumn: "Categoria",
      visibilityColumn: "Quem vê",
      openButton: "Abrir",
      addButton: "+ Adicionar exame",
      emptyTitle: "Nenhum exame guardado ainda",
      emptyDescription:
        "Envie PDFs ou fotos de exames e receitas para achar na hora da consulta.",
      notFoundTitle: "Nenhum exame encontrado",
      notFoundDescription: "Tente limpar a busca ou mudar o filtro de categoria.",
      selectPrompt: "Selecione um exame na lista",
      hiddenFooter:
        "Os demais exames não foram liberados pela administradora da conta.",
    },
    categories: {
      uncategorized: "Sem categoria",
      defineCategory: "Definir categoria",
      blood: "Sangue",
      image: "Imagem",
      cardiology: "Cardiologia",
      prescriptions: "Receitas",
      other: "Outros",
    },
    visibility: {
      family: "Família",
      familyPlus: "Família + {nome}",
      adminHint: "Administradoras sempre têm acesso.",
    },
    detail: {
      download: "Baixar",
      share: "Compartilhar",
      delete: "Excluir exame",
      edit: "Editar",
      previewFallback: "Pré-visualização do PDF",
      openNewTab: "Abrir em nova aba",
      fields: {
        name: "Nome",
        examDate: "Data do exame",
        provider: "Médico / clínica",
        category: "Categoria",
        notes: "Observações",
      },
      addedByTemplate: "{nome} · {data} às {hora}",
      deleteConfirm: "Excluir este exame? O arquivo será removido para sempre.",
    },
    autoRead: {
      title: "Leitura automática",
      tag: "Depois do MVP",
      body: "Na próxima fase, a Zelita vai ler seus arquivos para extrair a data, o tipo de exame, sugerir categorias e organizar tudo automaticamente.",
      neverTitle: "O que ela nunca vai fazer:",
      neverBody:
        "interpretar resultado, sugerir diagnóstico, indicar ou ajustar medicação. Isso é do médico, sempre. Qualquer resumo virá com esse aviso ao lado.",
    },
    uploadModal: {
      title: "Adicionar exame",
      dropHint: "Arraste um arquivo aqui ou",
      chooseFile: "escolha do computador",
      fileHint: "Foto pelo celular também funciona · até 25 MB",
      uploading: "Enviando…",
      uploaded: "Envio concluído",
      fields: {
        name: "Nome do exame",
        examDate: "Data do exame",
        provider: "Médico ou clínica",
        category: "Categoria",
        notes: "Observações",
        visibility: "Quem pode ver",
      },
      categoryPlaceholder: "Escolha uma categoria",
      cancel: "Cancelar",
      save: "Salvar exame",
      saving: "Salvando…",
      viewerHint:
        "Seu papel não permite enviar exames. Peça à administradora da conta.",
      pausedHint:
        "Conta pausada: você pode ver os exames, mas não enviar ou excluir até reativar.",
    },
    shareModal: {
      title: "Compartilhamento temporário",
      body: "Gere um link de leitura para compartilhar com quem está fora da conta — por exemplo, o médico na consulta.",
      securityNote:
        "O link não dá acesso ao painel. Expira automaticamente e deixa de funcionar se o exame for excluído.",
      durations: {
        "1h": "1 hora",
        "4h": "4 horas",
        today: "Até o fim do dia",
      },
      copyButton: "Copiar link",
      copied: "Link copiado",
      cancel: "Cancelar",
      generate: "Gerar link",
      generating: "Gerando…",
    },
    sharePublic: {
      expiredTitle: "Link expirado ou inválido",
      expiredBody: "Peça um novo link à pessoa que compartilhou o exame.",
      download: "Baixar arquivo",
    },
    hoje: {
      needsTitle: "Um exame sem categoria",
      needsSubtitleTemplate: "{titulo} de {data} · diga do que é",
    },
    errors: {
      uploadFailed: "Não foi possível enviar o arquivo. Tente de novo.",
      invalidFile: "Use PDF ou foto (JPG, PNG, WebP).",
      quotaExceeded:
        "Espaço de armazenamento esgotado. Exclua arquivos antigos ou aguarde Meu plano.",
      nameRequired: "Informe o nome do exame.",
      dateRequired: "Informe a data do exame.",
      saveFailed: "Não foi possível salvar o exame agora.",
    },
  },
  participantes: {
    loadError:
      "Não foi possível carregar quem participa agora. Recarregue a página ou tente de novo em instantes.",
    selfSuffix: " (você)",
    emergencyPhoneNote:
      "Será avisado em emergências pelo telefone cadastrado — sem acesso ao painel.",
    listCard: {
      titleTemplate: "Quem participa do cuidado de {apelido}",
      inviteButton: "+ Convidar pessoa",
      resendButton: "Reenviar",
    },
    situation: {
      active: { label: "Ativa", tone: "ok" },
      pending: { label: "Convite pendente", tone: "warning" },
      expired: { label: "Expirado", tone: "muted" },
    },
    matrix: {
      title: "O que cada papel pode fazer",
      legend:
        "● permitido · ◐ depende de autorização por item · — sem acesso",
      roleHeaders: {
        admin: "Administrador",
        caregiver: "Cuidador",
        viewer: "Visualizador",
        emergency_contact: "Contato de emergência",
      },
    },
    modal: {
      title: "Convidar pessoa",
      nameLabel: "Nome",
      namePlaceholder: "Como chamar essa pessoa",
      relationshipLabel: "Relação (opcional)",
      relationshipPlaceholder: "Ex.: filha, cuidadora, irmã",
      contactLabel: "E-mail ou WhatsApp",
      contactPlaceholder: "nome@email.com ou (11) 90000-0000",
      roleLabel: "Papel",
      rolesHint:
        "Administrador edita tudo · Cuidador acompanha e registra · Visualizador só olha · Contato de emergência recebe o pedido de ajuda",
      cancel: "Cancelar",
      submit: "Enviar convite",
      submitting: "Enviando…",
      nameRequired: "Informe como chamar a pessoa.",
      contactInvalid:
        "Informe um e-mail válido ou celular com DDD para convidar.",
      duplicatePending:
        "Já existe um convite pendente para este contato. Use Reenviar na lista.",
      duplicateActive: "Esta pessoa já participa do cuidado desta conta.",
      genericError:
        "Não foi possível enviar o convite agora. Tente de novo em instantes.",
      roles: [
        {
          slug: "caregiver",
          label: "Cuidador",
          description: "Acompanha a rotina, registra observações e confirma tomadas.",
        },
        {
          slug: "viewer",
          label: "Visualizador",
          description: "Vê horários e rotina — sem alterar cadastros.",
        },
        {
          slug: "emergency_contact",
          label: "Contato de emergência",
          description:
            "Recebe alertas de SOS. Só telefone entra ativo sem login no painel.",
        },
        {
          slug: "admin",
          label: "Administrador",
          description: "Gerencia tudo, convites e assinatura.",
        },
      ],
    },
    feedback: {
      inviteCreated:
        "Convite criado. Ele vale 7 dias — compartilhe o link abaixo.",
      inviteResent:
        "Convite reenviado com novo prazo de 7 dias. Compartilhe o link abaixo.",
      emergencyActive:
        "Contato adicionado para emergências. Escalonamento completo virá em Pedidos de ajuda.",
      copyLink: "Copiar link",
      copied: "Link copiado!",
      resendError: "Não foi possível reenviar agora. Tente de novo.",
      validityNote: "Convite válido por 7 dias.",
      manualShareNote:
        "Envio automático por e-mail ainda não está disponível — copie e compartilhe o link manualmente.",
    },
    accept: {
      title: "Você foi convidado para cuidar com a Zelita",
      expiredTitle: "Este convite expirou",
      expiredBody:
        "Convite vale 7 dias. Peça para quem convidou clicar em Reenviar — leva um segundo.",
      alreadyAcceptedTitle: "Convite já aceito",
      alreadyAcceptedBody:
        "Este convite já foi usado. Entre no painel se você já faz parte da conta.",
      notFoundTitle: "Convite não encontrado",
      notFoundBody:
        "Este link não existe ou não é mais válido. Peça um novo convite à administradora.",
      emailMismatchTitle: "Entre com o e-mail convidado",
      emailMismatchBody:
        "Você está logado com outro e-mail. Saia e entre com o endereço que recebeu o convite, ou peça reenvio.",
      invitedByTemplate: "{nome} convidou você",
      roleTemplate: "Papel: {papel}",
      recipientTemplate: "Para cuidar de {apelido}",
      loginCta: "Entrar com o e-mail convidado",
      acceptCta: "Aceitar convite",
      accepting: "Aceitando…",
      enterPanelCta: "Ir para o painel",
      successMessage: "Convite aceito! Redirecionando…",
    },
    viewerHint:
      "Seu papel permite ver quem participa, mas não convidar ou reenviar convites.",
    pausedHint:
      "Conta pausada — convites e reenvios ficam indisponíveis até reativar.",
  },
  localizacao: {
    loadError:
      "Não foi possível carregar a localização agora. Recarregue a página ou tente de novo em instantes.",
    consent: {
      activeTitle: "Ele autorizou compartilhar a localização",
      activeBody:
        "Autorizou em {data}. Pode revogar quando quiser no aparelho dele. A Zelita mostra segurança, não vigilância — sem trajeto minuto a minuto.",
      pendingTitle: "Aguardando autorização dele",
      pendingBody:
        "Nada aparece aqui sem o consentimento dele no aparelho vinculado. Quando autorizar, a última posição conhecida aparecerá nesta área.",
      revokedTitle: "Autorização desligada",
      revokedBody:
        "Ele revogou o compartilhamento. A posição abaixo pode estar desatualizada — é a última conhecida antes de desligar.",
      footer:
        "A Zelita prioriza segurança, não vigilância. Revogação é sempre possível no aparelho dele.",
    },
    map: {
      title: "Onde ele está",
      emptyTitle: "Localização indisponível",
      emptyDescription:
        "Quando ele autorizar no aparelho vinculado, a última posição conhecida aparecerá aqui — sempre com horário ao lado.",
      frozenHint:
        "Autorização desligada — posição pode estar desatualizada.",
      pinLabel: "{apelido} · {hora}",
      zoneSafe: "Zona segura · {lugar}",
      zoneOutside: "Fora das zonas",
      accuracy: "Precisão ~{metros} m",
      openExternal: "Abrir no mapa",
      shareQuickButton: "Compartilhar por 1h",
    },
    stats: {
      updated: "Atualizado",
      battery: "Bateria",
      permission: "Permissão",
      signal: "Sinal",
      empty: "—",
      deviceHint: "Disponível após vínculo do aparelho",
      batteryHint: "celular do {apelido}",
      permissionActive: "Ativa",
      permissionInactive: "Desligada",
      permissionHintActive: "segundo plano ligado",
      signalHintOk: "sem falhas de rede",
    },
    relativeTime: {
      justNow: "agora",
      minutes: "há {n} min",
      hours: "há {n} h",
      days: "há {n} d",
    },
    places: {
      title: "Lugares de sempre",
      addButton: "+ Adicionar",
      editButton: "Editar",
      emptyTitle: "Nenhum lugar cadastrado",
      emptyDescription:
        "Casa vem do cadastro. Adicione mercado, clínica ou outros lugares que ele frequenta.",
      tagPending: "Posição pendente",
      tagInside: "Dentro",
      tagOutside: "Fora",
      subtitlePending:
        "Confirme no aparelho dele para ligar aviso ao sair",
      subtitleConfirmed: "Raio de {raio} m{alerta}",
      alertOnExitSuffix: " · avisar ao sair",
    },
    placeModal: {
      addTitle: "Adicionar lugar",
      editTitle: "Editar lugar",
      nameLabel: "Nome",
      addressLabel: "Endereço",
      radiusLabel: "Raio (metros)",
      iconLabel: "Ícone (opcional)",
      alertOnExitLabel: "Avisar ao sair deste lugar",
      alertOnExitHint:
        "Só é possível ligar depois que a posição for confirmada no aparelho dele.",
      save: "Salvar",
      saving: "Salvando…",
      cancel: "Cancelar",
      deleteButton: "Remover",
      saveSuccess: "Lugar salvo.",
      deleteSuccess: "Lugar removido.",
    },
    share: {
      title: "Mostrar por um tempo",
      body:
        "Gere um link temporário para vizinho ou motorista ver a posição aproximada por algumas horas — expira sozinho.",
      createButton: "Criar link",
      disabledReason:
        "Precisa de consentimento vigente e ao menos uma posição registrada.",
    },
    shareModal: {
      title: "Compartilhar localização",
      hint:
        "Quem abrir o link vê só a posição aproximada e o horário — sem medicamentos, exames ou dados pessoais.",
      durationLabel: "Por quanto tempo",
      duration1h: "1 hora",
      duration3h: "3 horas",
      duration24h: "24 horas",
      confirm: "Gerar link",
      creating: "Gerando…",
      cancel: "Cancelar",
      success: "Link criado.",
      readyBody: "Copie e envie para quem precisa ver onde ele está agora:",
      copyButton: "Copiar link",
      copied: "Copiado!",
      close: "Fechar",
    },
    sharePublic: {
      title: "Localização compartilhada",
      expiredTitle: "Link expirado ou inválido",
      expiredBody:
        "Este link não está mais disponível. Peça um novo link para quem cuida dele.",
      openMap: "Abrir no mapa",
      privacyNote:
        "Posição aproximada compartilhada temporariamente. A Zelita não garante precisão indoor ou com bateria zerada.",
    },
    history: {
      title: "Onde ele esteve",
      filterTag: "Últimos 7 dias",
      emptyTitle: "Nenhum registro ainda",
      emptyDescription:
        "Quando houver entradas e saídas de zonas seguras, aparecerão aqui.",
      columns: {
        when: "Quando",
        where: "Onde",
        situation: "Situação",
      },
      situations: {
        safeZone: "Zona segura",
        zoneExit: "Saída de zona segura",
        returned: "Retornou",
      },
    },
    limitations: {
      title: "O que este mapa não garante",
      paragraphs: [
        "Ele decide o que compartilhar — e pode revogar quando quiser no aparelho dele.",
        "Se o celular estiver desligado ou sem bateria, nenhuma localização é enviada.",
        "Dentro de prédios, o GPS pode errar por centenas de metros.",
        "Sem internet, os avisos chegam atrasados — a última posição pode ser antiga.",
      ],
    },
    hoje: {
      statHint: "Atualizado às {hora}",
      statOutside: "Fora das zonas",
      statUnavailable: "Sem posição",
      widgetConfigured: "Autorizado · aguardando posição ou Casa ok",
      widgetPending: "Aguardando ele autorizar",
    },
    errors: {
      accessDenied: "Seu papel não permite ver localização.",
      loadFailed:
        "Não foi possível carregar a localização agora. Tente de novo.",
      manageForbidden: "Somente a administradora pode gerenciar lugares.",
      shareForbidden: "Somente a administradora pode criar links temporários.",
      accountPaused: "Conta pausada — ações indisponíveis até reativar.",
      invalidPlace: "Dados do lugar inválidos. Confira nome, endereço e raio.",
      invalidShare: "Duração do link inválida.",
      placeNotFound: "Lugar não encontrado.",
      cannotDeleteHome: "Casa não pode ser excluída — só ajustada.",
      alertNeedsCoords:
        "Confirme a posição no aparelho dele antes de ligar aviso ao sair.",
      shareUnavailable:
        "Link indisponível — precisa de consentimento vigente e posição registrada.",
      saveFailed: "Não foi possível salvar agora. Tente de novo.",
    },
  },
  avisos: {
    pausedHint:
      "Conta pausada — você pode ver o histórico, mas não editar quem recebe o quê.",
    feed: {
      cardTitle: "Alertas e eventos",
      filtersAriaLabel: "Filtrar avisos por assunto",
      filters: {
        all: "Todos",
        emergency: "Emergência",
        medications: "Medicamentos",
        location: "Localização",
      },
      status: {
        open: "Aberto",
        resolved: "Resolvido",
      },
      emptyIcon: "🔔",
      emptyTitle: "Nada por aqui ainda",
      emptyDescription:
        "Quando a Zelita avisar sobre remédios, pedidos de ajuda, convites ou outros assuntos, tudo ficará registrado aqui conforme a rotina.",
      filterEmptyTitle: "Nenhum aviso neste filtro",
      filterEmpty: {
        emergency: "Nenhum pedido de ajuda registrado ainda.",
        medications:
          "Nenhum aviso de medicamento ou lembrete sem leitura neste período.",
        location: "Nenhum aviso de localização ainda.",
      },
      loadMore: "Ver mais",
      packRefillTitle: "Atenção: medicamento próximo do fim",
      packRefillSubtitle:
        "{nome} {dose} — cartela prevista para terminar em {fim} — faltam {dias} dias",
      packLastDayTitle: "Último dia de cartela",
      reminderUnreadTitle: "Lembrete sem leitura",
      reminderUnreadSubtitle:
        "Reforço por voz registrado às {hora} — lembrete enviado não implica tomada",
      sosTitle: "Botão de ajuda acionado",
      sosSubtitleOpen: "Aguardando desfecho — veja em Pedidos de ajuda",
      sosSubtitleResolved:
        "{data} às {hora} — resolvido por {nome} às {horaResolucao}",
      zoneExitTitle: "Saída de zona segura",
      zoneExitSubtitleOpen:
        "{data} às {hora} — saiu de “{lugar}” — ainda fora",
      zoneExitSubtitleResolved:
        "{data} às {hora} — saiu de “{lugar}” — retornou às {horaRetorno}",
      inviteTitle: "Convite não aceito",
      inviteSubtitle: "{nome} ainda não entrou na conta",
      examTitle: "Exame sem categoria",
      examSubtitle: "{titulo} de {data} aguarda classificação",
      removedSource: "Item removido",
      linkView: "Ver",
    },
    matrix: {
      cardTitle: "Quem recebe o quê",
      editButton: "Editar preferências",
      editCell: "Editar",
      eventTypeHeader: "Tipo de evento",
      rowLabels: {
        sos: "Botão de ajuda (SOS)",
        pack_refill: "Cartela acabando",
        zone_exit: "Saída de zona segura",
        reminder_unread: "Lembrete sem leitura",
      },
      channelLabels: {
        panel: "Painel",
        email: "E-mail",
        whatsapp: "WhatsApp",
        call: "ligação",
      },
      emergencyPhoneNote:
        "+ contatos de emergência por ligação (sem coluna — só telefone)",
      readOnlyNote: "Somente administradores configuram avisos.",
      footerHint:
        "Quem recebe o quê se edita aqui. Tom de mensagem e horários vêm em Ajustes.",
      settingsLink: "Configurar canais e tom",
      saveSuccess: "Preferências salvas.",
      modal: {
        title: "Editar preferências",
        hint: "Canais para {membro} · {tipo}",
        cancel: "Cancelar",
        save: "Salvar",
        saving: "Salvando…",
      },
    },
    hoje: {
      noticesNoneHint: "Nada pendente por aqui",
      noticesNoneUrgentHint: "Nenhum é urgente",
      noticesUrgentHint: "Há pedido de ajuda aberto — confira agora",
      noticesAttentionHint: "Confira os avisos abertos",
      activityInvite: "Convite enviado para {nome}",
      activityExam: "Exame guardado · {titulo}",
    },
    errors: {
      loadTitle: "Não foi possível carregar Avisos",
      loadFailed:
        "Não foi possível carregar os avisos agora. Tente de novo em instantes.",
      forbidden: "Seu papel não permite acessar esta área.",
      incomplete: "Cadastro incompleto.",
      invalidPayload: "Dados inválidos para salvar preferências.",
      memberNotFound: "Participante não encontrado nesta conta.",
      invalidChannels: "Combinação de canais inválida para este papel.",
      sosEmergencyRequired:
        "Quem é contato de emergência sempre recebe pedido de ajuda.",
      saveFailed: "Não foi possível salvar. Tente de novo.",
      accountPaused: "Conta pausada — edição indisponível.",
    },
  },
  pedidosDeAjuda: {
    loadError:
      "Não foi possível carregar pedidos de ajuda agora. Recarregue a página ou tente de novo em instantes.",
    disclaimer: {
      icon: "⚠",
      body:
        "A Zelita não substitui serviço público de emergência (SAMU ou Bombeiros). O botão avisa a rede familiar cadastrada — ligue {samu} ou {bombeiros} se houver risco imediato.",
      samu: "192 (SAMU)",
      bombeiros: "193 (Bombeiros)",
      elderNote:
        "O mesmo aviso aparece na tela do idoso depois que ele confirma o pedido de ajuda.",
    },
    lastAlert: {
      title: "Último acionamento",
      emptyIcon: "🆘",
      emptyTitle: "Nenhum pedido de ajuda ainda",
      emptyDescription:
        "Quando ele apertar o botão de ajuda no aplicativo, você verá aqui o horário, quem foi avisado e o que aconteceu.",
      resolveButton: "Marcar como resolvido",
      pdfButton: "Baixar registro em PDF",
      pdfSoon: "Em breve",
      mapButton: "Ver no mapa",
      mapDisabledHint: "Localização disponível em Onde ele está",
      fields: {
        person: "Pessoa",
        time: "Horário",
        alertType: "Tipo do alerta",
        location: "Localização",
        callback: "Telefone para retorno",
        notified: "Notificados",
        outcome: "Desfecho",
      },
    },
    escalation: {
      title: "Quem a Zelita avisa primeiro",
      changeOrderButton: "Mudar ordem",
      emptyHint:
        "Configure quem recebe o alerta quando ele apertar o botão de ajuda.",
      invalidWarning:
        "Alguém saiu da conta desde a última configuração. Atualize a ordem de aviso.",
      singleContactWarning:
        "Com pelo menos dois contatos, o botão avisa mais gente. Ordem salva com um contato.",
      saveSuccess: "Ordem de aviso atualizada.",
      channels: {
        adminChannel: "Ligação + WhatsApp · imediato",
        caregiverChannel: "WhatsApp · imediato",
        viewerChannel: "WhatsApp · imediato (opt-in)",
        emergencyImmediate: "Ligação + WhatsApp · imediato",
        emergencyDelayed: "Ligação · se ninguém responder em 2 min",
      },
      roleLabels: {
        admin: "Administrador",
        caregiver: "Cuidador",
        viewer: "Visualizador",
        emergency_contact: "Contato de emergência",
      },
      modal: {
        title: "Quem avisar primeiro",
        hint: "Arraste para reordenar. Quem está em primeiro recebe o alerta na hora.",
        viewerOptInHint:
          "Alerta SOS para visualizador só entra se você incluir explicitamente.",
        includeViewerButton: "Incluir visualizador",
        saveButton: "Salvar ordem",
        saving: "Salvando…",
        cancel: "Cancelar",
        moveUp: "Subir",
        moveDown: "Descer",
      },
    },
    history: {
      title: "Histórico",
      testButton: "Testar o botão na tela do idoso",
      testModalTitle: "Teste na tela do idoso",
      testModalBody:
        "O teste real do botão de ajuda será feito na área do idoso (PWA), em uma atualização futura. Por enquanto, não simulamos SOS pelo painel da família.",
      testModalClose: "Entendi",
      sosIcon: "🆘",
      cancelledIcon: "↩",
      summary: {
        resolvedInMinutes: "Resolvido em {minutos} min",
        resolvedWithNote: "Resolvido em {minutos} min · {observacao}",
        cancelled: "Cancelado pelo idoso na confirmação",
        open: "Aberto",
      },
    },
    detail: {
      headline: "🆘 {apelido} pediu ajuda",
      personTemplate: "{pessoa}",
      alertType: "Botão de ajuda no aplicativo (confirmado pelo idoso)",
      locationUnavailable: "Localização indisponível",
      locationAccuracy: "Precisão ~{metros} m",
      locationTime: "atualizada às {hora}",
      locationZone: "Zona: {zona}",
      locationInsideZone: "dentro da zona “{zona}”",
      notifiedLineTemplate: "{nome} ({hora}, {canal} · {status})",
      notifiedPending:
        "Avisos serão registrados quando o envio estiver ativo.",
      outcomeWithNote: "Resolvido por {nome} às {hora} — {observacao}",
      outcomeWithoutNote: "Resolvido por {nome} às {hora}",
      callbackUnavailable: "Não cadastrado",
    },
    resolve: {
      title: "Marcar como resolvido",
      noteLabel: "O que aconteceu? (opcional)",
      notePlaceholder: "Ex.: tontura ao levantar, passou; sem queda",
      confirm: "Confirmar resolução",
      saving: "Salvando…",
      cancel: "Cancelar",
      saveSuccess: "Pedido marcado como resolvido.",
    },
    hoje: {
      needsTitle: "{apelido} pediu ajuda",
      needsSubtitle: "Acionado às {horario}",
      timelineTriggered: "Botão de ajuda acionado",
      timelineResolved: "Pedido de ajuda resolvido",
      emptyPanelConfigured: "{count} contatos na ordem de aviso",
      emptyPanelPending: "Ordem de aviso não configurada",
    },
    errors: {
      incompleteAccount: "Cadastro incompleto para ver pedidos de ajuda.",
      accessDenied:
        "Seu papel não permite ver pedidos de ajuda nesta conta.",
      loadFailed:
        "Não foi possível carregar pedidos de ajuda agora. Recarregue a página ou tente de novo em instantes.",
      escalationForbidden:
        "Só quem administra a conta pode alterar a ordem de aviso.",
      accountPaused:
        "Conta pausada: leitura permitida, mas não dá para salvar nova ordem até reativar.",
      invalidEscalation: "Selecione contatos válidos para a ordem de aviso.",
      saveFailed: "Não foi possível salvar agora. Tente de novo.",
      resolveForbidden:
        "Seu papel não permite marcar pedidos de ajuda como resolvidos.",
      invalidResolve: "Dados inválidos para resolver o pedido.",
      alertNotFound: "Pedido de ajuda não encontrado.",
      alreadyResolved: "Este pedido já foi marcado como resolvido por {nome}.",
      concurrentResolve:
        "Este pedido já foi marcado como resolvido por outra pessoa.",
    },
  },
};

/** Substitui `{apelido}` no template de subtítulo da área. */
export function formatFamilySubtitle(
  template: string,
  apelido: string,
): string {
  return template.replace("{apelido}", apelido);
}

/** Monta badge "Dia X de Y" da barra de trial. */
export function formatTrialBadge(
  template: string,
  current: number,
  total: number,
): string {
  return template
    .replace("{current}", String(current))
    .replace("{total}", String(total));
}

/** Progresso do checklist — "X de 4 feitas" ou "X de 4 prontas". */
export function formatChecklistProgress(
  template: string,
  count: number,
): string {
  return template.replace("{count}", String(count));
}
