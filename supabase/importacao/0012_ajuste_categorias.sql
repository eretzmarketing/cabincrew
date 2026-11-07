-- Cabin Crew · padroniza os nomes dos temas das questões (aparecem no "Desempenho por tema")
-- Pode rodar mais de uma vez.

update questoes set categoria = case
    when lower(categoria) like 'sequ%'                         then 'Sequências'
    when lower(categoria) like 'silogismo%'                    then 'Silogismos'
    when lower(categoria) like 'analogia%'                     then 'Analogias'
    when lower(categoria) like 'problema%'                     then 'Problemas lógicos'
    when lower(categoria) in ('raven_matrix', 'matrizes')      then 'Matrizes'
    when lower(categoria) like 'padr%'                         then 'Padrões'
    else categoria end
where banco = 'logico';

-- Questões técnicas extras: usa o assunto (Segurança, Legislação…) em vez de "BLOCO 1"
update questoes q set categoria = v.tema
from (values
  ('3577c58a-009e-4516-893b-059dd93df43f','Segurança'),('72176d6e-8b3c-4e0c-b3a7-2b93abcf302b','Legislação'),
  ('6c27e589-506a-45a6-a2c4-64e4b23826c6','Emergência'),('bb1f7926-48ba-449c-ab79-0b79674d288e','Legislação'),
  ('7e9ba8b2-4393-4cfc-b1e2-55602a1f1695','Documentação'),('8da60031-9022-45c3-a13a-48aac32e4c80','Segurança'),
  ('ac3d5d92-ecf4-4b7a-84b0-6eadf9655d99','Equipamentos'),('66a84efb-98b3-482f-8787-288d352fb1be','Segurança'),
  ('a903cc0c-e822-4f3d-bf12-378e5f0e6363','Documentação'),('8ee3228c-e257-4805-9f74-e526ba976b77','Emergência'),
  ('7b02abf6-eff6-47c0-a78a-f5430edf214a','Requisitos'),('a9e729ca-89fe-41f4-bfa6-7549375daeaf','Primeiros Socorros'),
  ('1be4f16d-7b65-4a60-9e1d-a2801059ee39','Equipamentos'),('9a589b5a-ddc9-4444-8ae2-53f5da133c0b','Procedimentos'),
  ('eeba3864-ab35-4937-9b0a-afde91997ee1','Segurança'),('21748524-adb0-4569-8bea-dd2f97310d6b','Emergência'),
  ('8a2a12d7-7490-4347-abf1-3392c101a927','Legislação'),('05bdbb09-a393-44f0-9a0f-b39212ea2b24','Meteorologia'),
  ('24e31f1b-d1c1-4ebc-a106-2fbb6b87a688','Conhecimentos Técnicos'),('474dd826-37f9-4ea1-8d22-e38fc5ffc51c','Procedimentos'),
  ('18d65fcb-a3cf-4c0b-b15c-130f3947f320','Equipamentos'),('167ca369-3a15-4129-ab1d-6340721d79b3','Legislação'),
  ('088e1258-9de8-4390-8a44-bbf813123f1d','Primeiros Socorros'),('56ee6fa2-2e2b-4148-9c62-baaf035b5dd7','Emergência'),
  ('e1f67911-8969-4e80-aa8a-000f47f1611a','Emergência'),('30e0b6fa-1dd7-483c-a0c2-62858edaa0dd','Primeiros Socorros'),
  ('93f79c83-f985-407f-ae10-c93a52d40d6e','Legislação'),('df048df0-d43e-45a2-bccf-49763ac571c3','Conhecimentos Técnicos'),
  ('96f6e1a9-afa8-4a2e-b7da-e50b0999ebac','Primeiros Socorros'),('76974e06-bc49-4ad7-b705-59e49437effd','Equipamentos')
) v(id, tema)
where q.banco = 'tecnico' and q.origem_id = v.id;

-- Conferência
select banco, categoria, count(*) from questoes where banco in ('logico', 'tecnico') group by 1, 2 order by 1, 2;
