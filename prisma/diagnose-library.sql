-- Diagnóstico da biblioteca — me manda o resultado.

SELECT
  (SELECT COUNT(*) FROM information_schema.tables
    WHERE table_name = 'library_items') AS tabela_existe,
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_name = 'library_items') AS qtd_colunas,
  (SELECT COUNT(*) FROM library_items) AS total_itens,
  (SELECT COUNT(DISTINCT category::text) FROM library_items) AS categorias_usadas;

-- Lista categorias que existem nas linhas vs as válidas do enum:
SELECT DISTINCT category::text AS category_no_banco FROM library_items
ORDER BY category::text;

SELECT unnest(enum_range(NULL::"LibraryCategory"))::text AS category_valida
ORDER BY 1;
