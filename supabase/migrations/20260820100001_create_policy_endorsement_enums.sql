-- Enums da spec policy-endorsements (ver .agents/specs/policy-endorsements/design.md).
-- Sem "convidar seguradoras" nem "vencedora" — a seguradora já é a da apólice.

create type policy_endorsement_type as enum (
  'vehicle_inclusion',
  'vehicle_exclusion',
  'coverage_change',
  'extension',
  'administrative_correction',
  'cancellation'
);

create type policy_endorsement_status as enum (
  'waiting',
  'presented',
  'client_accepted',
  'effected',
  'not_closed'
);
