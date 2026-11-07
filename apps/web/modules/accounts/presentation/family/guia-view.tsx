import { FamilyGuideStartButton } from "@/components/family-guide/family-guide-tour";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Note } from "@/components/ui/note";
import { FAMILY_GUIDE_NAME, familyGuidePage } from "@/content/family-guide";

function GuiaView() {
  const page = familyGuidePage;

  return (
    <div className="space-y-4">
      <Note tone="info" icon="🎓">
        <p>
          <strong>{page.noteLead}</strong> {page.noteBody}
        </p>
        <FamilyGuideStartButton className="mt-3" size="sm">
          {FAMILY_GUIDE_NAME}
        </FamilyGuideStartButton>
      </Note>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {page.cards.map((card) => (
          <Card key={card.id}>
            <CardHeader>
              <span aria-hidden className="text-lg">
                {card.icon}
              </span>
              <CardTitle className="font-head text-lg font-extrabold">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <section>
                <p className="text-label font-bold tracking-wide text-muted uppercase">
                  {page.sectionWhat}
                </p>
                <p className="mt-1 text-body text-ink">{card.what}</p>
              </section>
              <section>
                <p className="text-label font-bold tracking-wide text-muted uppercase">
                  {page.sectionWhy}
                </p>
                <p className="mt-1 text-body text-ink">{card.why}</p>
              </section>
              <section>
                <p className="text-label font-bold tracking-wide text-muted uppercase">
                  {page.sectionHow}
                </p>
                <p className="mt-1 text-body text-ink">{card.how}</p>
                {card.roles ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-body text-ink">
                    {card.roles.map((role) => (
                      <li key={role.title}>
                        <strong>{role.title}</strong> — {role.body}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
              {card.tip ? (
                <Note tone={card.tip.tone}>
                  <strong>{card.tip.label}</strong> {card.tip.text}
                </Note>
              ) : null}
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-head text-lg font-extrabold">
            {page.questionsTitle}
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          {page.questions.map((item) => (
            <section key={item.question}>
              <h3 className="font-head text-body font-extrabold text-ink">
                {item.question}
              </h3>
              <p className="mt-1 text-secondary text-muted">{item.answer}</p>
            </section>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

export { GuiaView };
