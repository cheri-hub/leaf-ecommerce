FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY src/EcommerceApi/*.csproj ./src/EcommerceApi/
RUN dotnet restore src/EcommerceApi/EcommerceApi.csproj
COPY src/ ./src/
RUN dotnet publish src/EcommerceApi/EcommerceApi.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "EcommerceApi.dll"]
