using EcommerceApi.Data;
using EcommerceApi.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace EcommerceApi.Services;

public sealed class SeedDataService(AppDbContext db, ILogger<SeedDataService> logger)
{
    public async Task SeedAsync(CancellationToken ct = default)
    {
        if (await db.Products.AnyAsync(ct))
        {
            logger.LogInformation("Banco já possui produtos — seed ignorado");
            return;
        }

        logger.LogInformation("Iniciando seed de dados de exemplo...");

        var categories = CreateCategories();
        db.Categories.AddRange(categories);
        await db.SaveChangesAsync(ct);

        var categoryMap = categories.ToDictionary(c => c.Slug);

        var products = CreateProducts(categoryMap);
        db.Products.AddRange(products);
        await db.SaveChangesAsync(ct);

        logger.LogInformation("Seed concluído: {CategoryCount} categorias, {ProductCount} produtos",
            categories.Count, products.Count);
    }

    private static List<Category> CreateCategories()
    {
        return
        [
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Perfumes Masculinos",
                Slug = "perfumes-masculinos",
                Description = "Fragrâncias sofisticadas para o homem moderno. Eau de Parfum com alta fixação e projeção intensa.",
                IsActive = true
            },
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Perfumes Femininos",
                Slug = "perfumes-femininos",
                Description = "Perfumes delicados e marcantes para todas as ocasiões. Florais, orientais e frutados com personalidade.",
                IsActive = true
            },
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Perfumes Unissex",
                Slug = "perfumes-unissex",
                Description = "Fragrâncias versáteis que transcendem gênero. Combinações únicas para quem busca originalidade.",
                IsActive = true
            },
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Linha Niche",
                Slug = "linha-niche",
                Description = "Fragrâncias exclusivas da linha premium. Composições ousadas e sofisticadas com ingredientes nobres.",
                IsActive = true
            },
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Acessórios",
                Slug = "acessorios",
                Description = "Complementos ideais para presentear. Sacolas e embalagens especiais.",
                IsActive = true
            }
        ];
    }

    private static List<Product> CreateProducts(Dictionary<string, Category> categories)
    {
        var masc = categories["perfumes-masculinos"].Id;
        var fem = categories["perfumes-femininos"].Id;
        var uni = categories["perfumes-unissex"].Id;
        var niche = categories["linha-niche"].Id;
        var acess = categories["acessorios"].Id;

        return
        [
            // ===== MASCULINOS =====
            Prod("Club Blue 100ml", "club-blue-100ml",
                "Amadeirado Aromático. Notas de Saída: Notas Oceânicas, Bergamota, Cardamomo. Notas de Corpo: Manjericão, Verbena, Sálvia, Raíz de Orris. Notas de Fundo: Camurça, Notas Amadeiradas, Patchouli. Eau de Parfum 100ml.",
                13700, 50, masc,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_lab8_clubblue-e4109c567e1a4191f417615773718453-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/cartuchofrasco_lab8_clubblue-44e5d8f3aabff35e1117619242003430-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_clubblue_lab8-a0e4e2f95ebbcee84117361747155684-480-0.webp")),

            Prod("Blue 100ml", "blue-100ml",
                "Amadeirado Aromático. Notas de Saída: Toranja, Limão, Hortelã, Pimenta Rosa. Notas de Corpo: Gengibre, Noz-moscada, Jasmim. Notas de Fundo: Incenso, Vetiver, Cedro, Sândalo, Patchouli, Ládano, Almíscar Branco. Eau de Parfum 100ml.",
                13700, 55, masc,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_lab8_blue-a2de96e609adccfa1f17615774470140-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/cartuchofrasco_lab8_blue-ad505fa7f03e5ab45617619250476117-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_blue_lab8-d0de94a4aea0d3b2f317361747058604-480-0.webp")),

            Prod("DOM 8 100ml", "dom-8-100ml",
                "Oriental Masculino. Notas de Saída: Lavanda, Limão Siciliano, Cardamomo. Notas de Corpo: Íris, Violeta, Fava Tonka. Notas de Fundo: Patchouli, Vetiver, Âmbar. Eau de Parfum 100ml.",
                13700, 40, masc,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_lab8_dom8-6484fc33ada809ee8417615770877333-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/cartuchofrasco_lab8_dom8-b39b6ecf33f20dbdd917619251310653-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_dom8_lab8-4e0820b78a9b96889f17361744651048-480-0.webp")),

            Prod("Acqua di Otto 100ml", "acqua-di-otto-100ml",
                "Aquático Cítrico. Notas de Saída: Limão, Lima, Bergamota, Jasmim, Laranja. Notas de Corpo: Mandarina, Neróli, Notas Oceânicas, Alecrim. Notas de Fundo: Cedro, Musgo de Carvalho, Patchouli, Âmbar. Eau de Parfum 100ml.",
                13700, 60, masc,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_lab8_acquadiotto-efdcef1b42b870448b17615774287232-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/cartuchofrasco_lab8_acquadiotto-1fa102e4bd35b95f7e17619250721025-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_acquadiotto_lab8-8b9130e4c77dcff65717361747255003-480-0.webp")),

            Prod("Jobs Elixir 100ml", "jobs-elixir-100ml",
                "Amadeirado Âmbar Especiado. Notas de Saída: Olíbano, Cardamomo. Notas de Corpo: Patchouli, Vetiver. Notas de Fundo: Ládano, Cedro. Eau de Parfum 100ml.",
                13700, 45, masc,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_lab8_jobselixir-3c40a6606cd63b489b17615771225226-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/cartuchofrasco_lab8_jobselixir-f69b3342f82b50d49d17619252413137-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_jobselixir_lab8-afc3d58f02ced1df6d17361746055804-480-0.webp")),

            Prod("Savana 100ml", "savana-100ml",
                "Cítrico Aromático. Notas de Saída: Pimenta, Bergamota. Notas de Corpo: Lavanda, Vetiver, Patchouli, Gerânio, Elemi. Notas de Fundo: Cedro, Ládano, Ambroxan, Âmbar. Eau de Parfum 100ml.",
                13700, 55, masc,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_lab8_savana-f6b15ff0f919fee41917615772621901-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/cartuchofrasco_lab8_savana-fc12f97a72a2dc4b7b17619243181736-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_savana_lab8-37c9b94f27ed99097117361746343204-480-0.webp")),

            Prod("Eau de Miyako 100ml", "eau-de-miyako-100ml",
                "Aquático Cítrico Amadeirado. Notas de Saída: Yuzu, Limão, Bergamota, Lima, Mandarina, Cipreste. Notas de Corpo: Lótus Azul, Noz-moscada, Lírio-do-Vale, Gerânio, Açafrão. Notas de Fundo: Vetiver do Tahiti, Almíscar, Cedro, Sândalo, Âmbar, Tabaco. Eau de Parfum 100ml.",
                13700, 50, masc,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_lab8_miyako-119ace3f158cfa606917615773346321-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/miyako_lab8-fd2fc1b9e1b4e1289417349159116604-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/cartuchofrasco_lab8_miyako-3e566215dfa2e2e0ec17619252617653-480-0.webp")),

            Prod("Código 8 100ml", "codigo-8-100ml",
                "Amadeirado Aromático. Notas de Saída: Bergamota, Folha de Bergamota. Notas de Corpo: Íris, Raíz de Orris, Aldeídos, Sálvia Esclaréia. Notas de Fundo: Fava Tonka, Cedro. Eau de Parfum 100ml.",
                13700, 40, masc,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_lab8_codigo8-4e413f20b541b9d09b17615771463744-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/cartuchofrasco_lab8_codigo8-e64b5a09dc22e5193617619252064506-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_codigo8_lab8-bd5e50a6ff14b85b6e17361745961949-480-0.webp")),

            Prod("Wood Green 100ml", "wood-green-100ml",
                "Amadeirado Chipre. Notas de Saída: Zimbro, Manjericão, Alcarávia, Coentro, Bergamota. Notas de Corpo: Pinheiro, Couro, Camomila, Pimenta, Cravo, Gerânio, Jasmim, Rosa. Notas de Fundo: Tabaco, Musgo de Carvalho, Patchouli, Cedro, Vetiver, Almíscar, Âmbar. Eau de Parfum 100ml.",
                13700, 45, masc,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_lab8_woodgreen-0d2aaaddf1e5380ff417615772446799-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/cartuchofrasco_lab8_woodgreen-4c1cdf10b79e04e1b517619243399200-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_woodgreen_lab8-18f42ae56b7ce4e32017361746548884-480-0.webp")),

            Prod("Allumer 100ml", "allumer-100ml",
                "Amadeirado Especiado. Notas de Saída: Laranja, Notas Oceânicas, Aldeídos. Notas de Corpo: Mandarina, Pimenta, Néroli, Cedro. Notas de Fundo: Baunilha, Fava Tonka, Almíscar Branco, Âmbar, Vetiver, Elemi. Eau de Parfum 100ml.",
                13700, 50, masc,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_lab8_allumer-8c27fc8e06afa6575017615774106237-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/cartuchofrasco_lab8_allumer-9ab4f027369639b4c017619251540331-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_allumer_lab8-df7949b754cfcebd3e17361746970654-480-0.webp")),

            Prod("Enigmático 100ml", "enigmatico-100ml",
                "Oriental Amadeirado. Notas de Saída: Acorde Ambarado, Bergamota Italiana, Almíscar, Fava Tonka. Notas de Corpo: Gerânio Africano, Cedro Texas, Sândalo. Notas de Fundo: Baunilha, Benjoim, Madeira Guaiac, Musgo de Carvalho. Eau de Parfum 100ml.",
                13700, 35, masc,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_enigmatico_lab8-ea70e44c28282f455d17627957853686-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/enigmatico_lab8-25e3ca2bf21b23e4f917600205400810-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_enigmatico_lab8_02-debc7f9f68e6e2ef1617628035849419-480-0.webp")),

            Prod("Deep Ventus 100ml", "deep-ventus-100ml",
                "Chipre Frutado. Notas de Saída: Bergamota, Groselha Preta, Maçã, Limão, Pimenta Rosa. Notas de Corpo: Abacaxi, Patchouli, Jasmim. Notas de Fundo: Vidoeiro, Almíscar, Musgo de Carvalho, Ambroxan, Cedro. Eau de Parfum 100ml.",
                13700, 60, masc,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_lab8_deepventus-a23fbe9bddbd530d0017615773534468-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/cartuchofrasco_lab8_deepventus-6b9ad5fa8cd27ca00617619251086653-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_deepventus_lab8-7a2c22f2cb5ad4b1b017361745753294-480-0.webp")),

            Prod("Bullet 100ml", "bullet-100ml",
                "Amadeirado Especiado. Notas de Saída: Limão, Gengibre, Lavanda, Hortelã. Notas de Corpo: Maçã, Zimbro, Cardamomo, Gerânio. Notas de Fundo: Fava Tonka, Madeira de Âmbar, Vetiver. Eau de Parfum 100ml.",
                13700, 55, masc,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_lab8_bullet-dd6c778471433253e117615773920957-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/cartuchofrasco_lab8_bullet-30c3a24faa1f3f3b8c17619250937627-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_bullet_lab8-42cdc1cd7e94b2411e17361747351024-480-0.webp")),

            Prod("Jobs Intense 100ml", "jobs-intense-100ml",
                "Amadeirado Especiado. Notas de Saída: Maçã, Flor de Laranjeira, Bergamota. Notas de Corpo: Canela, Cravo-da-Índia, Gerânio, Cardamomo, Lavanda. Notas de Fundo: Baunilha, Sândalo, Cumarina, Cedro, Vetiver. Eau de Parfum 100ml.",
                13700, 50, masc,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_lab8_jobsintense-d85a691a7717ad37ad17615773177171-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_jobsintense_lab8-bf4f8bab9bca119fc817361746155364-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/cartuchofrasco_lab8_jobsintense-c5b3e6e84c5b18d1c117619252206989-480-0.webp")),

            Prod("Infinity Intense Men 100ml", "infinity-intense-men-100ml",
                "Oriental Fougère. Notas de Saída: Bergamota, Lavanda, Amêndoa Amarga. Notas de Corpo: Madeira de Palo Santo, Jasmim, Violeta. Notas de Fundo: Baunilha, Sândalo, Âmbar. Eau de Parfum 100ml. Linha Fluy.",
                15700, 40, masc,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_infinity_men_01-c77c7875cf7391e7fe17601319914019-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_infinity_men_02-3f562f3f539dc55a7e17601319938524-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/infinity_intense_men_fluy-dd949a3856c9e4fb2b17513951489132-480-0.webp")),

            Prod("Provoking 100ml", "provoking-100ml",
                "Âmbar Especiado. Notas de Saída: Bergamota, Lavanda, Pimenta, Limão, Sálvia, Cardamomo. Notas de Corpo: Íris, Jasmim, Néroli, Fava Tonka, Baunilha. Notas de Fundo: Mirra, Cedro, Patchouli, Vetiver, Sândalo, Âmbar, Musk. Eau de Parfum 100ml. Linha Fluy.",
                15700, 35, masc,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_provoking_01-4e3de18b3698ec50df17601318960017-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_provoking_02-a78e06303d6ce7177c17601318986036-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/provoking_fluy-779d5e4e9e39b95a0b17513951312564-480-0.webp")),

            Prod("The Wave 100ml", "the-wave-100ml",
                "Aquático Amadeirado. Notas de Saída: Limão Siciliano, Mandarina, Sal Marinho, Gengibre. Notas de Corpo: Menta Spicata, Algas Marinhas. Notas de Fundo: Cedro, Âmbar, Musgo, Vetiver. Eau de Parfum 100ml. Linha Fluy.",
                15700, 45, masc,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/thewave_praia-1-809b21c6479b772bac17685948258644-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_thewave_01-41b2b59f5c6e8f51fb17601318540651-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_thewave_02-ee1a424e1e6a71700317601318572653-480-0.webp")),

            Prod("The Rustic 100ml", "the-rustic-100ml",
                "Amadeirado Intenso. Notas de Saída: Bergamota, Cardamomo, Pimenta Preta. Notas de Corpo: Couro, Cedro, Patchouli. Notas de Fundo: Sândalo, Incenso, Âmbar Seco. Eau de Parfum 100ml. Linha Fluy.",
                15700, 30, masc,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_the_rustic_02-794c16b5fe00f499a317601318199083-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_the_rustic_01-a93b0cae5a9a46f76117601318186720-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/the_rustic_fluy-8aeb3f2266cd9e8e1b17513952083940-480-0.webp")),

            // ===== FEMININOS =====
            Prod("La Vita 100ml", "la-vita-100ml",
                "Floral Frutado. Notas de Saída: Groselha Preta, Pera. Notas de Corpo: Íris, Jasmim, Flor de Laranjeira. Notas de Fundo: Pralinê, Baunilha, Patchouli, Fava Tonka. Eau de Parfum 100ml.",
                13700, 50, fem,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_lavita_lab8-e5af7776b9e4f59b8717625459798997-480-0.webp")),

            Prod("Dolce Blue 100ml", "dolce-blue-100ml",
                "Cítrico Frutado. Notas de Saída: Limão Siciliano, Maçã, Cedro, Câmpanula. Notas de Corpo: Bambú, Jasmim, Rosa Branca. Notas de Fundo: Cedro, Almíscar, Âmbar. Eau de Parfum 100ml.",
                13700, 45, fem,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_dolceblue_lab8-b8efa554757357aea117625449173136-480-0.webp")),

            Prod("Idolâtrie 100ml", "idolatrie-100ml",
                "Chipre Floral. Notas de Saída: Pêra, Bergamota, Pimenta Rosa. Notas de Corpo: Rosa, Jasmim. Notas de Fundo: Almíscar Branco, Baunilha, Patchouli, Cedro. Eau de Parfum 100ml.",
                13700, 40, fem,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_idolatrie_lab8-fa7bcf52beeb8b554e17345516617048-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/cartuchofrasco_lab8_idolatrie-2e6f0fd973f14f300c17619243656714-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_idolatrie_lab8-d2a6f504fabb23c18b17361746733344-480-0.webp")),

            Prod("Miss Sunshine 100ml", "miss-sunshine-100ml",
                "Chipre Floral Frutado. Notas de Saída: Cereja, Morango, Abacaxi, Tangerina, Tuberosa. Notas de Corpo: Jasmim, Frésia, Lírio-do-Vale, Flor de Laranjeira, Pralinê, Pipoca. Notas de Fundo: Baunilha, Patchouli. Eau de Parfum 100ml.",
                13700, 55, fem,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume-miss_lab8-2799f3ea7b042abec717623707054843-480-0.webp")),

            Prod("Diamant 100ml", "diamant-100ml",
                "Floral Sofisticado. Notas de Saída: Peônia, Lichia, Frésia. Notas de Corpo: Rosa, Lírio do Vale, Magnólia. Notas de Fundo: Cedro da Virgínia, Âmbar. Eau de Parfum 100ml.",
                13700, 45, fem,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_diamant_lab8-302ec15573500189fe17623538678050-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/diamant_lab8-8d7f4f1c2217ce66e217600204970510-480-0.webp")),

            Prod("Enigma Perfeito 100ml", "enigma-perfeito-100ml",
                "Oriental Floral. Notas de Saída: Pera, Tangerina, Bergamota. Notas de Corpo: Flor de Laranjeira, Néroli, Jasmim. Notas de Fundo: Baunilha, Âmbar, Almíscar Branco, Benjoim. Eau de Parfum 100ml.",
                13700, 40, fem,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_enigmaperfeito_lab8-7d056e6ae2893e383c17623524743230-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/enigma_perfeito_lab8-90b024ba67d24646ca17600205151982-480-0.webp")),

            Prod("Madame & Belle 100ml", "madame-belle-100ml",
                "Âmbar Floral Amadeirado. Notas de Saída: Bergamota, Laranja, Toranja. Notas de Corpo: Rosa, Lichia, Jasmim. Notas de Fundo: Patchouli, Baunilha, Almíscar, Vetiver. Eau de Parfum 100ml.",
                13700, 35, fem,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_madamebelle_lab8-272bf6fce6a764082a17627886698686-480-0.webp")),

            Prod("Angeline 100ml", "angeline-100ml",
                "Âmbar Baunilha Doce. Notas de Saída: Algodão-Doce, Coco, Cassis, Melão, Jasmim, Bergamota, Abacaxi, Mandarina. Notas de Corpo: Mel, Amora, Ameixa, Damasco, Pêssego, Jasmim, Orquídea, Noz-moscada, Rosa. Notas de Fundo: Patchouli, Chocolate, Caramelo, Baunilha, Fava Tonka, Âmbar, Almíscar, Sândalo. Eau de Parfum 100ml.",
                13700, 30, fem,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_lab8_angeline-d5830c3154c1b814ea17622871761304-480-0.webp")),

            Prod("Infinity Intense Women 100ml", "infinity-intense-women-100ml",
                "Floral Feminino. Notas de Saída: Bergamota, Lichia, Frutas Vermelhas. Notas de Corpo: Rosa, Peônia, Magnólia. Notas de Fundo: Almíscar, Âmbar, Baunilha. Eau de Parfum 100ml. Linha Fluy.",
                15700, 45, fem,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_infinity_women_01-67524fecfbaf597be617601319651190-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_infinity_women_02-7e1e159a3107b8d51517601319683498-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/infinity_intense_women_fluy-6d4a6e28cde2b4b10417513951663292-480-0.webp")),

            Prod("Afrodisia 100ml", "afrodisia-100ml",
                "Âmbar Floral. Notas de Saída: Amêndoa, Café, Ameixa, Damasco, Bergamota. Notas de Corpo: Jasmim, Flor de Laranjeira, Peônia, Lírio Branco, Sândalo. Notas de Fundo: Cacau, Baunilha, Caramelo, Âmbar, Canela, Cedro, Patchouli, Musk. Eau de Parfum 100ml. Linha Fluy.",
                15700, 35, fem,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_afrodisia_01-a7c0eeb73a1b16372717601319264435-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_afrodisia_02-e0c4e5fca8e1ddbb6917601319296414-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/afrodisia_fluy-23cd4b27daaed0d68117513951862380-480-0.webp")),

            // ===== UNISSEX =====
            Prod("Nectar Honey 100ml", "nectar-honey-100ml",
                "Floral Frutado Gourmet. Notas de Saída: Notas Verdes, Groselha Preta. Notas de Corpo: Petitgrain, Nectarina, Acácia Branca. Notas de Fundo: Pêssego, Ameixa, Vetiver. Eau de Parfum 100ml.",
                13700, 40, uni,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_lab8_nectarhoney-8c4de9dc976ea4de6917615771782640-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/cartuchofrasco_lab8_nectarhoney-1e19f8f5bb123b5f1117619252835169-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_nectarhoney_lab8-a4f6b204f7f94dbf9a17361746438864-480-0.webp")),

            Prod("Oud Premium 100ml", "oud-premium-100ml",
                "Âmbar Amadeirado. Notas de Saída: Oud, Pau-Brasil, Sândalo. Notas de Corpo: Cardamomo, Baunilha, Pimenta. Notas de Fundo: Vetiver, Fava Tonka, Âmbar. Eau de Parfum 100ml.",
                13700, 35, uni,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_lab8_oudpremium-cb0e47e95f66fdf28817615772849390-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/oudpremium_lab8-f6a48f3e4e6826da2817349149826580-480-0.webp")),

            Prod("The Night 100ml", "the-night-100ml",
                "Âmbar Baunilha Doce. Notas de Saída: Pera, Tangerina, Bergamota. Notas de Corpo: Morango, Orquídea, Rosa Negra. Notas de Fundo: Maracujá, Caramelo, Lichia, Baunilha, Patchouli, Café. Eau de Parfum 100ml.",
                13700, 50, uni,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_thenight2-3fdde1858dc24b974a17640222905473-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/the_night_lab8-2f0b23f8e90f8acbc817600204714186-480-0.webp")),

            Prod("Cherry Intense 100ml", "cherry-intense-100ml",
                "Frutal Gourmand. Notas de Saída: Cereja, Limão, Melancia. Notas de Corpo: Baunilha, Jasmim, Maçã. Notas de Fundo: Âmbar, Caramelo, Cedro. Eau de Parfum 100ml. Linha Fluy.",
                15700, 45, uni,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/cherry_intense-0a4c07ff539dd434e517667855325231-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/cherry_intense_02-ab5cfecbeab97c83ff17667855392990-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/cherry_intense_03-5af1df43e9b201e56e17667855404850-480-0.webp")),

            Prod("Chocolate Intenso 100ml", "chocolate-intenso-100ml",
                "Cítrico Gourmand. Notas de Saída: Semente de Cacau, Lavanda, Chocolate Amargo, Toranja, Mandarina. Notas de Corpo: Benjoim, Gengibre, Canela, Ládano, Olíbano. Notas de Fundo: Semente de Cacau, Caramelo, Âmbar, Vetiver, Sândalo, Almíscar. Eau de Parfum 100ml. Linha Fluy.",
                15700, 40, uni,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/chocolate_intenso_01-51d4d147aa2182276217443151808844-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/chocolate_intenso_02-01e33e66a94a2e0da317443151815764-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/chocolate_intenso-06e5e5b4b9eee4c06617443151843084-480-0.webp")),

            Prod("Pistacchio Intenso 100ml", "pistacchio-intenso-100ml",
                "Frutal Gourmand Doce. Notas de Saída: Maçã, Amêndoa, Pistache, Mandarina Verde. Notas de Corpo: Jasmim, Pêssego, Coco. Notas de Fundo: Âmbar, Musk, Musgo. Eau de Parfum 100ml. Linha Fluy.",
                15700, 38, uni,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_pistacchio_intenso_01-5c25e8158f188ccca817601320435527-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_pistacchio_intenso_02-d8b394ca22b8f40fb017601320475516-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/pistacchio_intenso_fluy-d9e4dd3e8ce3336d2617513952264776-480-0.webp")),

            Prod("Eau de Dominique 100ml", "eau-de-dominique-100ml",
                "Floral Suave e Fresco. Notas de Saída: Flores delicadas. Notas de Corpo: Frutas suaves. Notas de Fundo: Extratos vegetais. Sem álcool. 100ml. Linha Fluy.",
                15700, 30, uni,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/eau_de_dominique-37cf517822feb7f39817595272144320-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/eau_de_dominique_02-c459326e8e8a4f3daa17595272151570-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/eau_de_dominique_03-0e6e5ba2f2a24dccbf17595274098820-480-0.webp")),

            // ===== LINHA NICHE =====
            Prod("Windstorm 100ml", "windstorm-100ml",
                "Amadeirado Frutado — Linha Niche. Notas de Saída: Toranja, Bergamota, Pimenta Rosa, Groselha Preta, Abacaxi, Noz-moscada, Cravo-da-Índia. Notas de Corpo: Gengibre, Cidra, Canela, Cardamomo, Rosa. Notas de Fundo: Patchouli, Vetiver, Musgo de Carvalho, Ambroxan, Almíscar, Evernil, Sândalo, Fava Tonka. Eau de Parfum 100ml.",
                16700, 25, niche,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_windstorm_lab8_niche-f66c9cc0cd774e9db317646219579093-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/windstorm_new-1c68b6e24c38ff1b4617646272773013-480-0.webp")),

            Prod("Spicy Flame 100ml", "spicy-flame-100ml",
                "Oriental Especiado Amadeirado — Linha Niche. Notas de Saída: Canela, Tabaco, Cardamomo, Pimenta Rosa. Notas de Corpo: Sândalo, Patchouli, Heliotrópio, Gerânio, Jasmim. Notas de Fundo: Benjoim, Baunilha de Bourbon, Bálsamo-de-Tolu, Fava Tonka, Ambroxan. Eau de Parfum 100ml.",
                16700, 30, niche,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/spicyflame-5565dd375ff15bee0917667817335453-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/spicyflame_02-a6b1a5e66cd6dc4c3517667817564997-480-0.webp")),

            Prod("Effervescent 100ml", "effervescent-100ml",
                "Cítrico Amadeirado — Linha Niche. Notas de Saída: Toranja, Bergamota, Jasmim, Magnólia. Notas de Corpo: Gengibre, notas herbais e atalcadas. Notas de Fundo: Almíscar, Cedro, Âmbar, Patchouli, Raíz de Orris. Eau de Parfum 100ml.",
                16700, 28, niche,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/perfume_effervescent_lab8_niche-6a5b64e1ea58b0f83d17646272524429-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/effervescent_new-30d6153ea3f68ac48417665232549659-480-0.webp")),

            Prod("Audaz By Bil Araújo 100ml", "audaz-by-bil-araujo-100ml",
                "Amadeirado Intenso — Edição Especial. Notas de Saída: Bergamota Italiana, Pomelo, Pimenta Branca. Notas de Corpo: Couro, Oud, Cedro. Notas de Fundo: Âmbar, Baunilha, Musgo de Carvalho. Eau de Parfum 100ml.",
                18700, 20, niche,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/img_7482_tratada-1-b6957140f2c9dbc73e17619373547734-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/img_7492_tratada-1-42a4a7f121da0a823817619373576234-480-0.webp",
                     "https://acdn-us.mitiendanube.com/stores/003/165/134/products/audaz_fluy-de13a0b0a9b3e0ea9817513952510696-480-0.webp")),

            // ===== ACESSÓRIOS =====
            Prod("Sacola para Presente", "sacola-para-presente",
                "Sacola exclusiva para presente. Perfeita para embalar seu perfume favorito com elegância e sofisticação.",
                1200, 200, acess,
                Imgs("https://acdn-us.mitiendanube.com/stores/003/165/134/products/sacola_lab8-a50a713a60035e3cf317416253627211-480-0.webp"))
        ];
    }

    private static Product Prod(string name, string slug, string description,
        int priceInCents, int stock, Guid categoryId, List<ProductImage> images)
    {
        return new Product
        {
            Id = Guid.NewGuid(),
            Name = name,
            Slug = slug,
            Description = description,
            PriceInCents = priceInCents,
            Stock = stock,
            IsActive = true,
            CategoryId = categoryId,
            Images = images
        };
    }

    private static List<ProductImage> Imgs(params string[] urls)
    {
        return urls.Select((url, i) => new ProductImage
        {
            Id = Guid.NewGuid(),
            Url = url,
            AltText = null,
            DisplayOrder = i
        }).ToList();
    }
}
