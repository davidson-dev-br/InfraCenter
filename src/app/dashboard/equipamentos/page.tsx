"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, PlusCircle } from "lucide-react";
import { useInfra } from "@/components/dashboard/datacenter-switcher";
import { EquipamentosTable } from "@/components/dashboard/equipamentos/equipamentos-table";
import { EquipamentoDialog } from '@/components/dashboard/equipamentos/equipamento-dialog';
import { IAEquipamentoDialog } from '@/components/dashboard/equipamentos/ia-equipamento-dialog';

export default function EquipamentosPage() {
  const { equipment } = useInfra();

  return (
    <div className="container p-4 mx-auto my-8 sm:p-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-headline">Inventário de Equipamentos</CardTitle>
              <CardDescription>Gerencie todos os seus ativos de hardware.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <IAEquipamentoDialog>
                <Button variant="outline">
                  <Camera className="w-4 h-4 mr-2" />
                  Adicionar com Foto IA
                </Button>
              </IAEquipamentoDialog>
              <EquipamentoDialog>
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Adicionar Equipamento
                </Button>
              </EquipamentoDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <EquipamentosTable data={equipment} />
        </CardContent>
      </Card>
    </div>
  );
}
