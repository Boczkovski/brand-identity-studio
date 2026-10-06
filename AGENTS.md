<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Public campaign leads are written only through a validated server function and stored in private, service-role-only tables because personal data must never be readable from the browser.
- Administrative email is sent server-side through Lovable managed delivery after saving a validated lead, using a fixed recipient and event-derived idempotency; provider failures must not invalidate saved registrations. Existing notification task rows are legacy records, not an email dispatcher.
- Production builds outside Lovable target a self-contained Nitro Node.js server so GitHub-based Web App hosts can run the project.
