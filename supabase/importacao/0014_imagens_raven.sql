-- Cabin Crew · as figuras das Matrizes de Raven agora ficam no próprio site (cabincrew.com.br/raven-questions/…)
-- Rode depois de atualizar o site. Pode rodar mais de uma vez.

update questoes
set imagem_url = replace(imagem_url, 'https://horsky.com.br/raven-questions/', '/raven-questions/')
where imagem_url like 'https://horsky.com.br/raven-questions/%';

select count(*) as imagens_no_cabincrew from questoes where imagem_url like '/raven-questions/%';
